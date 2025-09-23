import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readStudentCSV = () => {
  try {
    const csvPath = path.join(__dirname, '../student_ids.csv');
    console.log('CSV Path:', csvPath);
    console.log('File exists:', fs.existsSync(csvPath));
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    console.log('CSV Content preview:', csvContent.substring(0, 200));
    
    const lines = csvContent.split('\n').filter(line => line.trim());
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
    
    return students;
  } catch (error) {
    console.error('Error reading student CSV:', error);
    return [];
  }
};

const validateStudentCredentials = (student_id, password) => {
  const students = readStudentCSV();
  console.log('Total students loaded:', students.length);
  console.log('First few students:', students.slice(0, 3));
  
  const student = students.find(s => s.student_id === student_id);
  console.log('Looking for student_id:', student_id);
  console.log('Found student:', student);
  
  if (!student) {
    return { valid: false, message: 'Student ID not found' };
  }
  
  if (student.password !== password) {
    console.log('Password mismatch. Expected:', student.password, 'Got:', password);
    return { valid: false, message: 'Invalid password' };
  }
  
  return { valid: true, student };
};

console.log('Testing CSV reading...');
const result = validateStudentCredentials('admin', 'admin123');
console.log('Validation result:', result);
