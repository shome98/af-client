'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useForm,
  useFieldArray,
  Controller,
  Control,
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiCheckLine,
} from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { createDynamicApi } from '@/lib/store/mongo-store';
import { toast } from 'sonner';
import { API_RESPONSE } from '@/constants/routes';

// Permission options
const PERMISSION_OPTIONS = ['SCRUD', 'SCRUDQ', 'MCRUD', 'MCRUDQ'] as const;

// Text index strategy options
const TEXT_INDEX_STRATEGY_OPTIONS = ['wildcard', 'explicit'] as const;

// Database options
const DATABASE_OPTIONS = ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite'] as const;

// Field type options
const FIELD_TYPE_OPTIONS = [
  'String',
  'Number',
  'Boolean',
  'Date',
  'ObjectId',
  'Mixed',
] as const;

// Stage type
type Stage = 1 | 2 | 3 | 4;

// Permission descriptions
const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  SCRUD: 'Single Record Create, Read, Update, Delete',
  SCRUDQ: 'Single Record with Query support',
  MCRUD: 'Multiple Records Create, Read, Update, Delete',
  MCRUDQ: 'Multiple Records with Query support',
};

// Explicit types for form values - defined before schemas
interface FieldDefinition {
  fieldName: string;
  type: 'String' | 'Number' | 'Boolean' | 'Date' | 'ObjectId' | 'Mixed';
  required: boolean;
  unique: boolean;
  ref?: string;
  enum?: string;
  default?: string;
  min?: number | string;
  max?: number | string;
  match?: string;
  message?: string;
  searchable: boolean;
}

interface RecordDefinition {
  record_name: string;
  fields: FieldDefinition[];
}

interface ApiConfigFormValues {
  permission: 'SCRUD' | 'SCRUDQ' | 'MCRUD' | 'MCRUDQ';
  database: 'MongoDB' | 'PostgreSQL' | 'MySQL' | 'SQLite';
  dbName?: string;
  dbUri?: string;
  soft_delete: boolean;
  textIndexStrategy?: 'wildcard' | 'explicit';
  recordDefinitions: RecordDefinition[];
}

// Field Definition Schema
const fieldDefinitionSchema = z.object({
  fieldName: z
    .string()
    .min(1, 'Field name is required')
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      'Must start with a letter, alphanumeric and underscores only',
    ),
  type: z.enum(FIELD_TYPE_OPTIONS),
  required: z.boolean(),
  unique: z.boolean(),
  ref: z.string().optional(),
  enum: z.string().optional(),
  default: z.string().optional(),
  min: z.union([z.number(), z.string()]).optional(),
  max: z.union([z.number(), z.string()]).optional(),
  match: z.string().optional(),
  message: z.string().optional(),
  searchable: z.boolean(),
});

// Record Definition Schema
const recordDefinitionSchema = z.object({
  record_name: z
    .string()
    .min(1, 'Record name is required')
    .max(64, 'Record name must be 64 characters or less')
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      'Must start with a letter, alphanumeric and underscores only',
    ),
  fields: z
    .array(fieldDefinitionSchema)
    .min(1, 'At least one field is required'),
});

// Stage-specific schemas
const stage1Schema = z.object({
  permission: z.enum(PERMISSION_OPTIONS),
});

const stage2Schema = z.object({
  database: z.enum(DATABASE_OPTIONS),
});

const stage3Schema = z.object({
  textIndexStrategy: z.enum(TEXT_INDEX_STRATEGY_OPTIONS).optional(),
});

const stage4Schema = z.object({
  dbName: z.string().optional(),
  dbUri: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith('mongodb'), {
      message: 'Must be a valid MongoDB URI starting with mongodb',
    }),
  soft_delete: z.boolean(),
  recordDefinitions: z
    .array(recordDefinitionSchema)
    .min(1, 'At least one record definition is required')
    .max(20, 'Maximum 20 record definitions allowed'),
});

// Full schema
const apiConfigSchema = z.object({
  permission: z.enum(PERMISSION_OPTIONS),
  database: z.enum(DATABASE_OPTIONS),
  dbName: z.string().optional(),
  dbUri: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith('mongodb'), {
      message: 'Must be a valid MongoDB URI starting with mongodb',
    }),
  soft_delete: z.boolean(),
  textIndexStrategy: z.enum(TEXT_INDEX_STRATEGY_OPTIONS).optional(),
  recordDefinitions: z
    .array(recordDefinitionSchema)
    .min(1, 'At least one record definition is required')
    .max(20, 'Maximum 20 record definitions allowed'),
});

// Default field values
const defaultField: FieldDefinition = {
  fieldName: '',
  type: 'String',
  required: false,
  unique: false,
  searchable: false,
};

// Default record values
const defaultRecord: RecordDefinition = {
  record_name: '',
  fields: [{ ...defaultField }],
};

// Check if permission supports queries
const supportsQueries = (permission: string): boolean => {
  return permission === 'SCRUDQ' || permission === 'MCRUDQ';
};

// Check if permission supports multiple records
const supportsMultipleRecords = (permission: string): boolean => {
  return permission === 'MCRUD' || permission === 'MCRUDQ';
};

export default function MongoForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { isCreating } = useAppSelector((state) => state.mongoApi);
  const [currentStage, setCurrentStage] = useState<Stage>(1);
  const [completedStages, setCompletedStages] = useState<Set<number>>(
    new Set(),
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ApiConfigFormValues>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      permission: 'MCRUDQ',
      database: 'MongoDB',
      soft_delete: true,
      textIndexStrategy: 'wildcard',
      recordDefinitions: [{ ...defaultRecord }],
    },
  });

  const permission = watch('permission');
  const textIndexStrategy = watch('textIndexStrategy');
  const hasQuerySupport = supportsQueries(permission);
  const hasMultipleRecords = supportsMultipleRecords(permission);

  const {
    fields: records,
    append: appendRecord,
    remove: removeRecord,
  } = useFieldArray({
    control,
    name: 'recordDefinitions',
  });

  // Validate current stage before proceeding
  const validateStage = async (stage: Stage): Promise<boolean> => {
    let fieldsToValidate: string[] = [];

    switch (stage) {
      case 1:
        fieldsToValidate = ['permission'];
        break;
      case 2:
        fieldsToValidate = ['database'];
        break;
      case 3:
        if (hasQuerySupport) {
          fieldsToValidate = ['textIndexStrategy'];
        }
        break;
      case 4:
        fieldsToValidate = [
          'dbName',
          'dbUri',
          'soft_delete',
          'recordDefinitions',
        ];
        break;
    }

    const result = await trigger(
      fieldsToValidate as (keyof ApiConfigFormValues)[],
    );
    return result;
  };

  // Handle next stage
  const handleNext = async () => {
    const isValid = await validateStage(currentStage);
    if (isValid) {
      setCompletedStages((prev) => new Set([...prev, currentStage]));
      if (currentStage < 4) {
        setCurrentStage((prev) => (prev + 1) as Stage);
      }
    }
  };

  // Handle previous stage
  const handlePrevious = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => (prev - 1) as Stage);
    }
  };

  // Handle stage click (only if completed or previous)
  const handleStageClick = (stage: Stage) => {
    if (stage <= currentStage || completedStages.has(stage - 1)) {
      setCurrentStage(stage);
    }
  };

  const onSubmit = async (data: ApiConfigFormValues) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to create an API');
      return;
    }

    // Transform data to match the expected API format
    const payload = {
      permission: data.permission,
      soft_delete: data.soft_delete,
      textIndexStrategy: data.textIndexStrategy,
      ...(data.dbName && { dbName: data.dbName }),
      ...(data.dbUri && { dbUri: data.dbUri }),
      recordDefinitions: data.recordDefinitions.map((record) => ({
        record_name: record.record_name,
        record_config: record.fields.reduce(
          (acc, field) => {
            const fieldConfig: Record<string, unknown> = {
              type: field.type,
            };

            if (field.required) fieldConfig.required = true;
            if (field.unique) fieldConfig.unique = true;
            if (field.ref) fieldConfig.ref = field.ref;
            if (field.enum) {
              fieldConfig.enum = field.enum
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            }
            if (field.default !== undefined && field.default !== '') {
              if (field.type === 'Number') {
                const num = parseFloat(field.default);
                fieldConfig.default = isNaN(num) ? field.default : num;
              } else if (field.default === 'Date.now') {
                fieldConfig.default = 'Date.now';
              } else {
                fieldConfig.default = field.default;
              }
            }
            if (
              field.min !== undefined &&
              field.min !== '' &&
              !isNaN(Number(field.min))
            )
              fieldConfig.min = Number(field.min);
            if (
              field.max !== undefined &&
              field.max !== '' &&
              !isNaN(Number(field.max))
            )
              fieldConfig.max = Number(field.max);
            if (field.match) fieldConfig.match = field.match;
            if (field.message) fieldConfig.message = field.message;
            if (field.searchable) fieldConfig.searchable = true;

            acc[field.fieldName] = fieldConfig;
            return acc;
          },
          {} as Record<string, unknown>,
        ),
      })),
    };

    // Get access token from auth state or cookie
    const result = await dispatch(
      createDynamicApi({
        duration: '15-days',
        payload:
          payload as unknown as import('@/types/mongo.types').CreateDynamicApiPayload,
        accessToken: '', // The auth-api uses cookies, so we pass empty but the API will use cookies
      }),
    );

    if (createDynamicApi.fulfilled.match(result)) {
      toast.success('API created successfully!');
      router.push(API_RESPONSE);
    } else if (result.payload && typeof result.payload === 'object') {
      const errorPayload = result.payload as { message?: string };
      toast.error(errorPayload.message || 'Failed to create API');
    } else {
      toast.error('Failed to create API');
    }
  };

  // Calculate progress
  const progress = (currentStage / 4) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create API</h1>
          <span className="text-sm text-muted-foreground">
            Step {currentStage} of 4
          </span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Stage Indicators */}
        <div className="flex justify-between mt-4">
          {[1, 2, 3, 4].map((stage) => (
            <button
              key={stage}
              onClick={() => handleStageClick(stage as Stage)}
              disabled={stage > currentStage && !completedStages.has(stage - 1)}
              className={`flex flex-col items-center gap-2 transition-all ${
                stage === currentStage
                  ? 'text-primary'
                  : completedStages.has(stage)
                    ? 'text-primary/70'
                    : 'text-muted-foreground'
              } ${
                stage > currentStage && !completedStages.has(stage - 1)
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:text-primary'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stage === currentStage
                    ? 'bg-primary text-primary-foreground'
                    : completedStages.has(stage)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {completedStages.has(stage) ? (
                  <RiCheckLine className="w-4 h-4" />
                ) : (
                  stage
                )}
              </div>
              <span className="text-xs hidden sm:block">
                {stage === 1 && 'API Type'}
                {stage === 2 && 'Database'}
                {stage === 3 && 'Index Strategy'}
                {stage === 4 && 'Configuration'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Stage 1: API Permission */}
        {currentStage === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: API Type & Permission</CardTitle>
              <CardDescription>
                Select the type of API you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERMISSION_OPTIONS.map((perm) => (
                  <Controller
                    key={perm}
                    name="permission"
                    control={control}
                    render={({ field }) => (
                      <div
                        onClick={() => field.onChange(perm)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          field.value === perm
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              field.value === perm
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground'
                            }`}
                          />
                          <div>
                            {/* <div className="font-semibold">{perm}</div> */}
                            <div className="text-sm text-muted-foreground">
                              {PERMISSION_DESCRIPTIONS[perm]}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                ))}
              </div>
              {errors.permission && (
                <p className="text-sm text-destructive">
                  {errors.permission.message}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="button" onClick={handleNext}>
                Next
                <RiArrowRightLine className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Stage 2: Database Selection */}
        {currentStage === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Database Selection</CardTitle>
              <CardDescription>
                Choose the database for your API (MongoDB is selected by
                default)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DATABASE_OPTIONS.map((db) => (
                  <Controller
                    key={db}
                    name="database"
                    control={control}
                    render={({ field }) => (
                      <div
                        onClick={() => db === 'MongoDB' && field.onChange(db)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          field.value === db
                            ? 'border-primary bg-primary/5'
                            : db === 'MongoDB'
                              ? 'border-border hover:border-primary/50 cursor-pointer'
                              : 'border-border opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              field.value === db
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground'
                            }`}
                          />
                          <div>
                            <div className="font-semibold">{db}</div>
                            <div className="text-sm text-muted-foreground">
                              {db === 'MongoDB'
                                ? 'Available now'
                                : 'Coming soon'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                ))}
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Currently only MongoDB is supported.
                  Other databases will be available in future updates.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button type="button" onClick={handleNext}>
                Next
                <RiArrowRightLine className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Stage 3: Text Index Strategy */}
        {currentStage === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Text Index Strategy</CardTitle>
              <CardDescription>
                {hasQuerySupport
                  ? 'Configure how text search will work for your API'
                  : 'Text search is not available for this API type'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {hasQuerySupport ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TEXT_INDEX_STRATEGY_OPTIONS.map((strategy) => (
                      <Controller
                        key={strategy}
                        name="textIndexStrategy"
                        control={control}
                        render={({ field }) => (
                          <div
                            onClick={() => field.onChange(strategy)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              field.value === strategy
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  field.value === strategy
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                }`}
                              />
                              <div>
                                <div className="font-semibold capitalize">
                                  {strategy}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {strategy === 'wildcard'
                                    ? 'All fields are searchable by default'
                                    : 'Only selected fields are searchable'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                  {errors.textIndexStrategy && (
                    <p className="text-sm text-destructive">
                      {errors.textIndexStrategy.message}
                    </p>
                  )}

                  {textIndexStrategy === 'explicit' && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> With explicit strategy, you will
                        be able to mark individual fields as searchable in the
                        next step.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Text search and index strategy is only available for SCRUDQ
                    and MCRUDQ API types.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You selected: <strong>{permission}</strong>
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button type="button" onClick={handleNext}>
                Next
                <RiArrowRightLine className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Stage 4: Database Config + Record Definitions */}
        {currentStage === 4 && (
          <>
            {/* Database Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Database Configuration</CardTitle>
                <CardDescription>
                  Configure your database connection and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Database Name and URI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbName">Database Name</Label>
                    <Input
                      id="dbName"
                      placeholder="e.g., my_service_db"
                      {...register('dbName')}
                    />
                    {errors.dbName && (
                      <p className="text-sm text-destructive">
                        {errors.dbName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbUri">Database URI</Label>
                    <Input
                      id="dbUri"
                      placeholder="mongodb://..."
                      {...register('dbUri')}
                    />
                    {errors.dbUri && (
                      <p className="text-sm text-destructive">
                        {errors.dbUri.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Soft Delete Toggle */}
                <div className="flex items-center space-x-3">
                  <Controller
                    name="soft_delete"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="soft_delete" className="cursor-pointer">
                      Enable Soft Delete
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Records will be marked as deleted instead of being
                      permanently removed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Record Definitions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Record Definitions</h3>
                  <p className="text-sm text-muted-foreground">
                    Define your MongoDB models (1-20 records)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendRecord({ ...defaultRecord })}
                  disabled={records.length >= 20}
                >
                  <RiAddLine className="w-4 h-4 mr-1" />
                  Add Record
                </Button>
              </div>

              {errors.recordDefinitions &&
                !Array.isArray(errors.recordDefinitions) && (
                  <p className="text-sm text-destructive">
                    {errors.recordDefinitions.message}
                  </p>
                )}

              {/* Record Cards */}
              <div className="space-y-4">
                {records.map((record, recordIndex) => (
                  <RecordCard
                    key={record.id}
                    recordIndex={recordIndex}
                    control={control}
                    register={register}
                    watch={watch}
                    errors={errors}
                    onRemove={() => removeRecord(recordIndex)}
                    canRemove={records.length > 1}
                    hasMultipleRecords={hasMultipleRecords}
                    showSearchable={
                      textIndexStrategy === 'explicit' && hasQuerySupport
                    }
                    onAddRecord={() => appendRecord({ ...defaultRecord })}
                  />
                ))}
              </div>

              {/* Add Record Button for MCRUD/MCRUDQ (bottom center) */}
              {hasMultipleRecords && records.length < 20 && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendRecord({ ...defaultRecord })}
                  >
                    <RiAddLine className="w-4 h-4 mr-1" />
                    Add Another Record
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button type="submit" size="lg" disabled={isCreating}>
                {isCreating ? 'Creating API...' : 'Create API Configuration'}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

// Record Card Component
interface RecordCardProps {
  recordIndex: number;
  control: Control<ApiConfigFormValues>;
  register: UseFormRegister<ApiConfigFormValues>;
  watch: UseFormWatch<ApiConfigFormValues>;
  errors: FieldErrors<ApiConfigFormValues>;
  onRemove: () => void;
  canRemove: boolean;
  hasMultipleRecords: boolean;
  showSearchable: boolean;
  onAddRecord: () => void;
}

function RecordCard({
  recordIndex,
  control,
  register,
  watch,
  errors,
  onRemove,
  canRemove,
  hasMultipleRecords,
  showSearchable,
  onAddRecord,
}: RecordCardProps) {
  const {
    fields: fieldDefs,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control,
    name: `recordDefinitions.${recordIndex}.fields`,
  });

  const recordErrors = errors.recordDefinitions?.[recordIndex];
  const recordName = watch(`recordDefinitions.${recordIndex}.record_name`);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Record {recordIndex + 1}</Badge>
            {recordName && (
              <span className="text-sm text-muted-foreground">
                {recordName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasMultipleRecords && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddRecord}
              >
                <RiAddLine className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-destructive hover:text-destructive"
              >
                <RiDeleteBinLine className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor={`recordDefinitions.${recordIndex}.record_name`}>
            Record Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`recordDefinitions.${recordIndex}.record_name`}
            placeholder="e.g., User, Product, Order"
            className="w-full md:w-64 mt-2"
            {...register(`recordDefinitions.${recordIndex}.record_name`)}
          />
          {recordErrors?.record_name && (
            <p className="text-sm text-destructive mt-1">
              {recordErrors.record_name.message}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recordErrors?.fields && !Array.isArray(recordErrors.fields) && (
          <p className="text-sm text-destructive">
            {recordErrors.fields.message}
          </p>
        )}

        {/* Fields Accordion */}
        <Accordion type="multiple" className="space-y-3">
          {fieldDefs.map((field, fieldIndex) => (
            <FieldAccordionItem
              key={field.id}
              recordIndex={recordIndex}
              fieldIndex={fieldIndex}
              control={control}
              register={register}
              errors={errors}
              onRemove={() => removeField(fieldIndex)}
              canRemove={fieldDefs.length > 1}
              showSearchable={showSearchable}
            />
          ))}
        </Accordion>

        {/* Add Field Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendField({ ...defaultField })}
          className="w-full"
        >
          <RiAddLine className="w-4 h-4 mr-1" />
          Add Field
        </Button>
      </CardContent>
    </Card>
  );
}

// Field Accordion Item Component
interface FieldAccordionItemProps {
  recordIndex: number;
  fieldIndex: number;
  control: Control<ApiConfigFormValues>;
  register: UseFormRegister<ApiConfigFormValues>;
  errors: FieldErrors<ApiConfigFormValues>;
  onRemove: () => void;
  canRemove: boolean;
  showSearchable: boolean;
}

function FieldAccordionItem({
  recordIndex,
  fieldIndex,
  control,
  register,
  errors,
  onRemove,
  canRemove,
  showSearchable,
}: FieldAccordionItemProps) {
  const fieldPath =
    `recordDefinitions.${recordIndex}.fields.${fieldIndex}` as const;
  const fieldErrors =
    errors.recordDefinitions?.[recordIndex]?.fields?.[fieldIndex];

  // Use state to track the current field type for conditional rendering
  const [currentType, setCurrentType] = React.useState('String');

  return (
    <AccordionItem
      value={`field-${recordIndex}-${fieldIndex}`}
      className="border rounded-lg px-4 bg-card/50"
    >
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            Field {fieldIndex + 1}
          </Badge>
          <span className="font-medium">
            {fieldErrors?.fieldName?.message ? (
              <span className="text-destructive">Unnamed Field</span>
            ) : (
              'New Field'
            )}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pb-2">
          {/* Delete Field Button */}
          {canRemove && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-destructive hover:text-destructive h-6 px-2"
              >
                <RiDeleteBinLine className="w-3 h-3 mr-1" />
                Remove Field
              </Button>
            </div>
          )}

          {/* Field Name and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${fieldPath}.fieldName`}>
                Field Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`${fieldPath}.fieldName`}
                placeholder="e.g., email, age, createdAt"
                {...register(
                  `recordDefinitions.${recordIndex}.fields.${fieldIndex}.fieldName`,
                )}
              />
              {fieldErrors?.fieldName && (
                <p className="text-sm text-destructive">
                  {fieldErrors.fieldName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${fieldPath}.type`}>
                Type <span className="text-destructive">*</span>
              </Label>
              <Controller
                name={`recordDefinitions.${recordIndex}.fields.${fieldIndex}.type`}
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setCurrentType(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Boolean Options */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Controller
                name={`recordDefinitions.${recordIndex}.fields.${fieldIndex}.required`}
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label className="cursor-pointer text-sm">Required</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name={`recordDefinitions.${recordIndex}.fields.${fieldIndex}.unique`}
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label className="cursor-pointer text-sm">Unique</Label>
            </div>

            {showSearchable && (
              <div className="flex items-center space-x-2">
                <Controller
                  name={`recordDefinitions.${recordIndex}.fields.${fieldIndex}.searchable`}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label className="cursor-pointer text-sm">Searchable</Label>
              </div>
            )}
          </div>

          {/* Reference (for ObjectId) */}
          {currentType === 'ObjectId' && (
            <div className="space-y-2">
              <Label htmlFor={`${fieldPath}.ref`}>Reference Model</Label>
              <Input
                id={`${fieldPath}.ref`}
                placeholder="e.g., User, Product"
                {...register(
                  `recordDefinitions.${recordIndex}.fields.${fieldIndex}.ref`,
                )}
              />
              <p className="text-xs text-muted-foreground">
                Name of the model this field references
              </p>
            </div>
          )}

          {/* Enum Values */}
          <div className="space-y-2">
            <Label htmlFor={`${fieldPath}.enum`}>Enum Values</Label>
            <Input
              id={`${fieldPath}.enum`}
              placeholder="comma, separated, values"
              {...register(
                `recordDefinitions.${recordIndex}.fields.${fieldIndex}.enum`,
              )}
            />
            <p className="text-xs text-muted-foreground">
              Enter comma-separated allowed values
            </p>
          </div>

          {/* Default Value */}
          <div className="space-y-2">
            <Label htmlFor={`${fieldPath}.default`}>Default Value</Label>
            <Input
              id={`${fieldPath}.default`}
              placeholder={
                currentType === 'Date'
                  ? 'Date.now or ISO date'
                  : 'default value'
              }
              {...register(
                `recordDefinitions.${recordIndex}.fields.${fieldIndex}.default`,
              )}
            />
            <p className="text-xs text-muted-foreground">
              {currentType === 'Date'
                ? 'Use "Date.now" for current timestamp'
                : 'Default value when not specified'}
            </p>
          </div>

          {/* Min/Max (for Number) */}
          {currentType === 'Number' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${fieldPath}.min`}>Minimum</Label>
                <Input
                  id={`${fieldPath}.min`}
                  type="number"
                  placeholder="0"
                  {...register(
                    `recordDefinitions.${recordIndex}.fields.${fieldIndex}.min`,
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${fieldPath}.max`}>Maximum</Label>
                <Input
                  id={`${fieldPath}.max`}
                  type="number"
                  placeholder="100"
                  {...register(
                    `recordDefinitions.${recordIndex}.fields.${fieldIndex}.max`,
                  )}
                />
              </div>
            </div>
          )}

          {/* Match Pattern (for String) */}
          {currentType === 'String' && (
            <div className="space-y-2">
              <Label htmlFor={`${fieldPath}.match`}>
                Match Pattern (Regex)
              </Label>
              <Input
                id={`${fieldPath}.match`}
                placeholder="^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$"
                {...register(
                  `recordDefinitions.${recordIndex}.fields.${fieldIndex}.match`,
                )}
              />
              <p className="text-xs text-muted-foreground">
                Regular expression pattern for validation
              </p>
            </div>
          )}

          {/* Validation Message */}
          <div className="space-y-2">
            <Label htmlFor={`${fieldPath}.message`}>Validation Message</Label>
            <Input
              id={`${fieldPath}.message`}
              placeholder="Custom error message for validation failures"
              {...register(
                `recordDefinitions.${recordIndex}.fields.${fieldIndex}.message`,
              )}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
