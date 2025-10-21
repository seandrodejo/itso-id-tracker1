import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../student_ids.csv');
console.log('📁 Reading CSV from:', csvPath);
console.log('📁 File exists:', fs.existsSync(csvPath));

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split(/\r?\n/).filter(line => line.trim());

console.log('\n📋 Total lines:', lines.length);
console.log('📋 First 5 lines:');

for (let i = 0; i < Math.min(5, lines.length); i++) {
  const [student_id, email, password] = lines[i].split(',');
  console.log(`Line ${i}:`, { student_id, email, password });
}

console.log('\n🔍 Testing student lookup for "2023-170301":');
const students = [];
for (let i = 1; i < lines.length; i++) {
  const [student_id, email, password] = lines[i].split(',');
  if (student_id && student_id.trim()) {
    students.push({
      student_id: student_id.trim(),
      email: email ? email.trim() : '',
      password: password ? password.trim() : '12345'
    });
  }
}

const testStudent = students.find(s => s.student_id === '2023-170301');
console.log('Found student:', testStudent);

console.log('\n📊 Total students loaded:', students.length);
console.log('First 3 students:', students.slice(0, 3));