'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

// Validation Schema
const projectSchema = z.object({
  projectName: z.string().min(3, 'Project name is too short'),
  priority: z.enum(['low', 'medium', 'high']),
  budget: z.coerce.number().positive('Budget must be greater than 0'),
  deadline: z.string().min(1, 'Please select a date'),
  description: z.string().min(10, 'Give us a bit more detail (min 10 chars)'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function MongoForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: '',
      budget: 0,
      description: '',
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    console.log('Processing request...', data);

    setTimeout(() => {
      console.log('Success:', data);
      reset();
    }, 1500);
  };

  return (
    <Card className="w-full max-w-xl mx-auto mt-12 shadow-lg">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Fill in the technical specifications below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* 1. Project Name (Native Register) */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="e.g. Apollo Mission"
              {...register('projectName')}
            />
            {errors.projectName && (
              <p className="text-sm text-destructive">
                {errors.projectName.message}
              </p>
            )}
          </div>

          {/* 2. Priority (Controlled via Select) */}
          <div className="space-y-2">
            <Label>Priority Level</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.priority && (
              <p className="text-sm text-destructive">
                {errors.priority.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 3. Budget (Number) */}
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input id="budget" type="number" {...register('budget')} />
              {errors.budget && (
                <p className="text-sm text-destructive">
                  {errors.budget.message}
                </p>
              )}
            </div>

            {/* 4. Deadline (Date string) */}
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" {...register('deadline')} />
              {errors.deadline && (
                <p className="text-sm text-destructive">
                  {errors.deadline.message}
                </p>
              )}
            </div>
          </div>

          {/* 5. Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Brief Description</Label>
            <Input
              id="description"
              placeholder="Technical overview..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Generating Project...' : 'Submit Project'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
