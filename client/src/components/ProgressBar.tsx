interface ProgressBarProps {
  teacherCoverage: number;
  studentCoverage: number;
  className?: string;
}

export default function ProgressBar({ teacherCoverage, studentCoverage, className = '' }: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
        <span>Teacher Coverage</span>
        <span>{teacherCoverage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gray-400 h-2 rounded-full"
          style={{ width: `${teacherCoverage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
        <span>Student Coverage</span>
        <span>{studentCoverage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gray-800 h-2 rounded-full"
          style={{ width: `${studentCoverage}%` }}
        />
      </div>
    </div>
  );
}
