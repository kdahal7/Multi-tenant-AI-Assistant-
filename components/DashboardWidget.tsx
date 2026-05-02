'use client';

interface Widget {
  id: string;
  type: 'card' | 'chart' | 'table' | 'metric';
  title: string;
  config?: Record<string, any>;
  order: number;
}

interface DashboardWidgetProps {
  widget: Widget;
}

export default function DashboardWidget({ widget }: DashboardWidgetProps) {
  const renderWidget = () => {
    switch (widget.type) {
      case 'metric':
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-2">{widget.title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {widget.config?.value || 0}
            </p>
          </div>
        );

      case 'card':
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    widget.config?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {widget.config?.status || 'inactive'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500 text-sm">Chart placeholder</p>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3">Item 1</td>
                    <td className="py-2 px-3">100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderWidget();
}
