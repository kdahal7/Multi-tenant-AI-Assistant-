'use client';

import { useState } from 'react';

interface Widget {
  id: string;
  type: 'card' | 'chart' | 'table' | 'metric';
  title: string;
  config?: Record<string, any>;
  order: number;
}

interface Section {
  id: string;
  title: string;
  widgets: Widget[];
  order: number;
}

interface DashboardEditorProps {
  config: { sections: Section[] };
  onSave: (config: any) => Promise<void>;
  loading?: boolean;
}

export default function DashboardEditor({
  config,
  onSave,
  loading,
}: DashboardEditorProps) {
  const [sections, setSections] = useState<Section[]>(config.sections);

  const handleUpdateWidget = (
    sectionId: string,
    widgetId: string,
    updates: Partial<Widget>
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          widgets: section.widgets.map((widget) => {
            if (widget.id !== widgetId) return widget;
            return { ...widget, ...updates };
          }),
        };
      })
    );
  };

  const handleAddWidget = (sectionId: string) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: 'card',
      title: 'New Widget',
      order: 999,
    };

    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          widgets: [...section.widgets, newWidget],
        };
      })
    );
  };

  const handleRemoveWidget = (sectionId: string, widgetId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          widgets: section.widgets.filter((w) => w.id !== widgetId),
        };
      })
    );
  };

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.id} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>

          <div className="space-y-4">
            {section.widgets.map((widget) => (
              <div
                key={widget.id}
                className="border-l-4 border-blue-500 pl-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={widget.title}
                    onChange={(e) =>
                      handleUpdateWidget(section.id, widget.id, {
                        title: e.target.value,
                      })
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Widget title"
                  />

                  <select
                    value={widget.type}
                    onChange={(e) =>
                      handleUpdateWidget(section.id, widget.id, {
                        type: e.target.value as Widget['type'],
                      })
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="card">Card</option>
                    <option value="chart">Chart</option>
                    <option value="table">Table</option>
                    <option value="metric">Metric</option>
                  </select>
                </div>

                <button
                  onClick={() => handleRemoveWidget(section.id, widget.id)}
                  className="ml-4 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleAddWidget(section.id)}
            className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors font-medium"
          >
            + Add Widget
          </button>
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={() => onSave({ sections })}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
