'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RiArrowLeftLine, RiSaveLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { USER_ROUTES } from '@/constants/routes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchApiById,
  updateRegistryApi,
  clearSelectedApi,
  clearErrors,
} from '@/lib/store/registry-store';
import { toast } from 'sonner';
import type { PermissionType } from '@/types/mongo.types';

const PERMISSION_OPTIONS: PermissionType[] = [
  'SCRUD',
  'SCRUDQ',
  'MCRUD',
  'MCRUDQ',
];
const TEXT_INDEX_OPTIONS = ['wildcard', 'explicit'] as const;

const editApiSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  permission: z.enum(['SCRUD', 'SCRUDQ', 'MCRUD', 'MCRUDQ']),
  softDelete: z.boolean(),
  textIndexStrategy: z.enum(['wildcard', 'explicit']).nullable(),
  hasDocsAccess: z.boolean(),
  isActive: z.boolean(),
  dbName: z
    .string()
    .max(64, 'Database name must be 64 characters or less')
    .optional(),
  dbUri: z.string().optional(),
});

type EditApiFormValues = z.infer<typeof editApiSchema>;

interface ApiEditFormProps {
  apiId: string;
}

export function ApiEditForm({ apiId }: ApiEditFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedApi, isLoading, isUpdating, error, updateError } =
    useAppSelector((state) => state.registry);

  const form = useForm<EditApiFormValues>({
    resolver: zodResolver(editApiSchema),
    defaultValues: {
      name: '',
      description: '',
      permission: 'MCRUDQ',
      softDelete: true,
      textIndexStrategy: 'wildcard',
      hasDocsAccess: true,
      isActive: true,
      dbName: '',
      dbUri: '',
    },
  });

  useEffect(() => {
    dispatch(fetchApiById(apiId));

    return () => {
      dispatch(clearSelectedApi());
    };
  }, [dispatch, apiId]);

  useEffect(() => {
    if (selectedApi) {
      form.reset({
        name: selectedApi.name,
        description: selectedApi.description || '',
        permission: selectedApi.permission,
        softDelete: selectedApi.softDelete,
        textIndexStrategy: selectedApi.textIndexStrategy as
          | 'wildcard'
          | 'explicit'
          | null,
        hasDocsAccess: selectedApi.hasDocsAccess,
        isActive: selectedApi.isActive,
        dbName: selectedApi.dbName,
        dbUri: selectedApi.dbUri,
      });
    }
  }, [selectedApi, form]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (updateError) {
      toast.error(updateError);
      dispatch(clearErrors());
    }
  }, [error, updateError, dispatch]);

  const onSubmit = async (values: EditApiFormValues) => {
    const result = await dispatch(
      updateRegistryApi({
        id: apiId,
        payload: {
          name: values.name,
          description: values.description || null,
          permission: values.permission,
          softDelete: values.softDelete,
          textIndexStrategy: values.textIndexStrategy,
          hasDocsAccess: values.hasDocsAccess,
          isActive: values.isActive,
          dbName: values.dbName,
          dbUri: values.dbUri,
        },
      }),
    );

    if (updateRegistryApi.fulfilled.match(result)) {
      toast.success('API updated successfully');
      router.push(USER_ROUTES.API_DETAIL(apiId));
    }
  };

  if (isLoading || !selectedApi) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/my-apis/${apiId}`}>
            <RiArrowLeftLine className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit API</h1>
          <p className="text-sm text-muted-foreground">
            Update API configuration for {selectedApi.name}
          </p>
        </div>
      </div>

      {updateError && (
        <Alert variant="destructive">
          <AlertDescription>{updateError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the basic details of your API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="permission">Permission</Label>
              <Select
                value={form.watch('permission')}
                onValueChange={(value) =>
                  form.setValue('permission', value as PermissionType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSION_OPTIONS.map((perm) => (
                    <SelectItem key={perm} value={perm}>
                      {perm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Update API behavior and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this API
                </p>
              </div>
              <Switch
                checked={form.watch('isActive')}
                onCheckedChange={(checked) =>
                  form.setValue('isActive', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Soft Delete</Label>
                <p className="text-sm text-muted-foreground">
                  Records will be marked as deleted instead of permanently
                  removed
                </p>
              </div>
              <Switch
                checked={form.watch('softDelete')}
                onCheckedChange={(checked) =>
                  form.setValue('softDelete', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Documentation Access</Label>
                <p className="text-sm text-muted-foreground">
                  Enable Swagger documentation for this API
                </p>
              </div>
              <Switch
                checked={form.watch('hasDocsAccess')}
                onCheckedChange={(checked) =>
                  form.setValue('hasDocsAccess', checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Text Index Strategy</Label>
              <Select
                value={form.watch('textIndexStrategy') || 'none'}
                onValueChange={(value) =>
                  form.setValue(
                    'textIndexStrategy',
                    value === 'none'
                      ? null
                      : (value as 'wildcard' | 'explicit'),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {TEXT_INDEX_OPTIONS.map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
            <CardDescription>
              Update database connection details (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dbName">Database Name</Label>
              <Input
                id="dbName"
                {...form.register('dbName')}
                placeholder="e.g., my_service_db"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dbUri">Database URI</Label>
              <Input
                id="dbUri"
                {...form.register('dbUri')}
                placeholder="mongodb://..."
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the default database
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <RiSaveLine className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/my-apis/${apiId}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
