interface ProductInstanceSelectorProps {
  productInstances: Array<{
    _id: string;
    name: string;
    productType: string;
    namespace: string;
  }>;
  loading?: boolean;
  onSelect: (productInstanceId: string) => void;
}

export default function ProductInstanceSelector({
  productInstances,
  loading = false,
  onSelect,
}: ProductInstanceSelectorProps) {
  const isEmpty = !loading && productInstances.length === 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Select Product</h2>
        <p className="text-gray-600 mt-1">Choose which product instance you want to chat with</p>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="text-sm text-gray-500">Loading products...</div>
        )}

        {isEmpty && (
          <div className="text-sm text-gray-500">No product instances found.</div>
        )}

        {!loading && productInstances.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productInstances.map((product) => (
              <button
                key={product._id}
                onClick={() => onSelect(product._id)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">{product.productType}</p>
                  </div>
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-sm text-gray-600 mt-4">Click to start chatting</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
