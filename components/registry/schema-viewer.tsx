'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { RecordDefinition } from '@/types/mongo.types';

interface SchemaViewerProps {
  recordDefinitions: RecordDefinition[];
}

export function SchemaViewer({ recordDefinitions }: SchemaViewerProps) {
  if (!recordDefinitions || recordDefinitions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No record definitions found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recordDefinitions.map((record, index) => (
        <div key={index} className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{record.record_name}</h4>
            <Badge variant="outline" className="text-xs">
              {Object.keys(record.record_config).length} fields
            </Badge>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Field Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Constraints</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(record.record_config).map(
                  ([fieldName, config]) => (
                    <TableRow key={fieldName}>
                      <TableCell className="font-mono text-sm">
                        {fieldName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {config.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {config.required && (
                            <Badge variant="outline" className="text-xs">
                              required
                            </Badge>
                          )}
                          {config.unique && (
                            <Badge variant="outline" className="text-xs">
                              unique
                            </Badge>
                          )}
                          {config.searchable && (
                            <Badge variant="outline" className="text-xs">
                              searchable
                            </Badge>
                          )}
                          {config.ref && (
                            <Badge variant="outline" className="text-xs">
                              ref: {config.ref}
                            </Badge>
                          )}
                          {config.enum && (
                            <Badge variant="outline" className="text-xs">
                              enum: {config.enum.join(', ')}
                            </Badge>
                          )}
                          {config.default !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              default: {String(config.default)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
