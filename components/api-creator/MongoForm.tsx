'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  useForm,
  useFieldArray,
  Controller,
  Control,
  UseFormRegister,
  FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RiAddLine, RiDeleteBinLine } from '@remixicon/react';

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
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { createDynamicApi } from '@/lib/store/mongo-store';
import { toast } from 'sonner';

// Permission options
const PERMISSION_OPTIONS = ['SCRUD', 'SCRUDQ', 'MCRUD', 'MCRUDQ'] as const;

// Text index strategy options
const TEXT_INDEX_STRATEGY_OPTIONS = ['wildcard', 'explicit'] as const;

// Field type options
const FIELD_TYPE_OPTIONS = [
  'String',
  'Number',
  'Boolean',
  'Date',
  'ObjectId',
  'Mixed',
] as const;

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

// Main API Configuration Schema
const apiConfigSchema = z.object({
  permission: z.enum(PERMISSION_OPTIONS),
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

export default function MongoForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { isCreating } = useAppSelector((state) => state.mongoApi);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ApiConfigFormValues>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      permission: 'MCRUDQ',
      soft_delete: true,
      textIndexStrategy: 'wildcard',
      recordDefinitions: [{ ...defaultRecord }],
    },
  });

  const {
    fields: records,
    append: appendRecord,
    remove: removeRecord,
  } = useFieldArray({
    control,
    name: 'recordDefinitions',
  });

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
    // Note: The auth-api uses cookies automatically, but we need the token for the mongo API
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
      router.push('/api-response');
    } else if (result.payload && typeof result.payload === 'object') {
      const errorPayload = result.payload as { message?: string };
      toast.error(errorPayload.message || 'Failed to create API');
    } else {
      toast.error('Failed to create API');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Top-level Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure the MongoDB API factory settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Permission and Text Index Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="permission">
                  Permission <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="permission"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permission level" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERMISSION_OPTIONS.map((perm) => (
                          <SelectItem key={perm} value={perm}>
                            {perm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.permission && (
                  <p className="text-sm text-destructive">
                    {errors.permission.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="textIndexStrategy">Text Index Strategy</Label>
                <Controller
                  name="textIndexStrategy"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEXT_INDEX_STRATEGY_OPTIONS.map((strategy) => (
                          <SelectItem key={strategy} value={strategy}>
                            {strategy}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.textIndexStrategy && (
                  <p className="text-sm text-destructive">
                    {errors.textIndexStrategy.message}
                  </p>
                )}
              </div>
            </div>

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
                  Records will be marked as deleted instead of being permanently
                  removed
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
                errors={errors}
                onRemove={() => removeRecord(recordIndex)}
                canRemove={records.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isCreating}>
            {isCreating ? 'Creating API...' : 'Create API Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Record Card Component
interface RecordCardProps {
  recordIndex: number;
  control: Control<ApiConfigFormValues>;
  register: UseFormRegister<ApiConfigFormValues>;
  errors: FieldErrors<ApiConfigFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

function RecordCard({
  recordIndex,
  control,
  register,
  errors,
  onRemove,
  canRemove,
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

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Record {recordIndex + 1}</Badge>
            <div className="space-y-1">
              <Label htmlFor={`recordDefinitions.${recordIndex}.record_name`}>
                Record Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`recordDefinitions.${recordIndex}.record_name`}
                placeholder="e.g., User, Product, Order"
                className="w-64"
                {...register(`recordDefinitions.${recordIndex}.record_name`)}
              />
              {recordErrors?.record_name && (
                <p className="text-sm text-destructive">
                  {recordErrors.record_name.message}
                </p>
              )}
            </div>
          </div>
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
      </CardHeader>
      <CardContent className="space-y-4">
        {recordErrors?.fields && !Array.isArray(recordErrors.fields) && (
          <p className="text-sm text-destructive">
            {recordErrors.fields.message}
          </p>
        )}

        {/* Fields Accordion */}
        <Accordion type="multiple" className="space-y-2">
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
}

function FieldAccordionItem({
  recordIndex,
  fieldIndex,
  control,
  register,
  errors,
  onRemove,
  canRemove,
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
      className="border rounded-lg px-4"
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
