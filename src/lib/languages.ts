export type TargetLang = 
  | 'curl'
  | 'javascript' 
  | 'nodejs'
  | 'python' 
  | 'php' 
  | 'go' 
  | 'java' 
  | 'csharp'
  | 'perl'
  | 'powershell'
  | 'wget'
  | 'dart'
  | 'swift'
  | 'rust';

export const TARGETS: { value: TargetLang; label: string; icon: string }[] = [
  { value: 'javascript', label: 'JavaScript', icon: '🌐' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'nodejs', label: 'Node.js', icon: '🟢' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'csharp', label: 'C#', icon: '🔷' },
  { value: 'curl', label: 'cURL (Windows)', icon: '🪟' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'swift', label: 'Swift', icon: '🦉' },
  { value: 'dart', label: 'Dart', icon: '🎯' },
  { value: 'perl', label: 'Perl', icon: '🐪' },
  { value: 'powershell', label: 'PowerShell', icon: '💙' },
  { value: 'wget', label: 'Wget', icon: '📥' },
];
