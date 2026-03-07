import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-8xl mb-4">🔧</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">This page doesn't exist. Maybe the tool you need is on our homepage!</p>
      <Link to="/" className="btn-primary">← Back to Home</Link>
    </div>
  );
}
