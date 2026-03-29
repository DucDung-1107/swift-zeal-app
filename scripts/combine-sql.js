import fs from 'fs';
import path from 'path';

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.startsWith('202') && f.endsWith('.sql'))
  .sort();

let combined = '-- AUTO-GENERATED: COMBINED ALL MIGRATIONS FOR A NEW PROJECT\n\n';

for (const f of files) {
  combined += `-- ==========================================\n`;
  combined += `-- File: ${f}\n`;
  combined += `-- ==========================================\n`;
  let sqlContent = fs.readFileSync(path.join(migrationsDir, f), 'utf-8');
  
  // Fix postgres syntax error for the messages constraint
  sqlContent = sqlContent.replace(
    /ALTER TABLE messages\s+ADD CONSTRAINT IF NOT EXISTS messages_conversation_id_fkey\s+FOREIGN KEY \(conversation_id\)\s+REFERENCES conversations \(id\)\s+ON DELETE CASCADE;/g,
    () => `DO $$ BEGIN\n  ALTER TABLE messages\n    ADD CONSTRAINT messages_conversation_id_fkey\n    FOREIGN KEY (conversation_id)\n    REFERENCES conversations (id)\n    ON DELETE CASCADE;\nEXCEPTION\n  WHEN duplicate_object THEN null;\nEND $$;`
  );

  // Strip anything touching storage.buckets or storage.objects
  // Since SQL can be multi-line, we can remove CREATE POLICY ... ON storage... using regex
  sqlContent = sqlContent.replace(/CREATE POLICY[^;]+ON storage\.[a-z]+[^;]+;/gi, '');
  sqlContent = sqlContent.replace(/DROP POLICY IF EXISTS[^;]+ON storage\.[a-z]+;/gi, '');
  sqlContent = sqlContent.replace(/ALTER TABLE storage\.[a-z]+[^;]+;/gi, '');
  sqlContent = sqlContent.replace(/INSERT INTO storage\.buckets[^;]+;/gi, '');

  combined += sqlContent;
  combined += '\n\n';
}

const finalFixFile = 'RUN_THIS_IN_SUPABASE_SQL_EDITOR.sql';
if (fs.existsSync(path.join(migrationsDir, finalFixFile))) {
  combined += `-- ==========================================\n`;
  combined += `-- File: ${finalFixFile}\n`;
  combined += `-- ==========================================\n`;
  let fixContent = fs.readFileSync(path.join(migrationsDir, finalFixFile), 'utf-8');
  
  fixContent = fixContent.replace(/CREATE POLICY[^;]+ON storage\.[a-z]+[^;]+;/gi, '');
  fixContent = fixContent.replace(/DROP POLICY IF EXISTS[^;]+ON storage\.[a-z]+;/gi, '');
  fixContent = fixContent.replace(/ALTER TABLE storage\.[a-z]+[^;]+;/gi, '');
  fixContent = fixContent.replace(/INSERT INTO storage\.buckets[^;]+;/gi, '');
  
  // Remove empty DO Blocks that might contain dropped statements
  fixContent = fixContent.replace(/DO \$\$\s*BEGIN\s*EXCEPTION WHEN undefined_table THEN\s*NULL;\s*END\s*\$\$;/gi, '');

  combined += fixContent;
  combined += '\n\n';
}

fs.writeFileSync(path.join(process.cwd(), 'supabase', '00_INIT_NEW_PROJECT.sql'), combined);
console.log('Combined all migrations and stripped storage DDL! Size:', combined.length);
