import React from 'react';
import { FiArrowLeft, FiDollarSign, FiUser, FiPhone, FiCalendar } from 'react-icons/fi';

const OrderDetails = ({ order, onUpdateStatus, onProcessPayment, onBack }) => {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ORDER_ACCEPTED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-orange-100 text-orange-800',
    READY: 'bg-green-100 text-green-800',
    SERVED: 'bg-purple-100 text-purple-800',
    COMPLETE: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <FiArrowLeft />
              <span>Back to Orders</span>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              Order Details - {order.orderNumber}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
              {order.status.replace('_', ' ')}
            </span>
            
            {!order.paymentDetails && (
              <button
                onClick={() => onProcessPayment(order)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiDollarSign />
                <span>Process Payment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Customer Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiUser className="text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{order.customerName}</div>
                </div>
              </div>
              
              {order.customerPhone && (
                <div className="flex items-center space-x-3">
                  <FiPhone className="text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{order.customerPhone}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <FiCalendar className="text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Order Date</div>
                  <div className="font-medium">{formatDate(order.createdAt)}</div>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-800 mb-3">Payment Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Total:</span>
                  <span className="font-medium">{formatCurrency(order.subtotal || order.totalAmount)}</span>
                </div>
                {order.discount && order.discount.amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({order.discount.percentage}%):</span>
                    <span className="font-medium">-{formatCurrency(order.discount.amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (2.5%):</span>
                  <span className="font-medium">{formatCurrency(order.gst || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SGST (2.5%):</span>
                  <span className="font-medium">{formatCurrency(order.sgst || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-800">Total Amount:</span>
                  <span className="font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Order Status</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="READY">Ready</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                Last updated: {formatDate(order.updatedAt)}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Information</h3>
            
            {order.paymentDetails ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="font-medium">{order.paymentDetails.method}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Amount Paid</div>
                  <div className="font-medium">{formatCurrency(order.paymentDetails.amount)}</div>
                </div>
                
                {order.paymentDetails.transactionId && (
                  <div>
                    <div className="text-sm text-gray-500">Transaction ID</div>
                    <div className="font-medium">{order.paymentDetails.transactionId}</div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm text-gray-500">Paid At</div>
                  <div className="font-medium">{formatDate(order.paymentDetails.paidAt)}</div>
                </div>
                
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium inline-block">
                  Payment Complete
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium inline-block mb-3">
                  Payment Pending
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(order.totalAmount)}
                </div>
                <div className="text-sm text-gray-500">Amount Due</div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Order Items</h3>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Add-ons</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(item.basePrice)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.variation ? (
                        <div>
                          <div>{item.variation.name}</div>
                          <div className="text-gray-500">+{formatCurrency(item.variation.price)}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.addons && item.addons.length > 0 ? (
                        <div className="space-y-1">
                          {item.addons.map((addon, addonIndex) => (
                            <div key={addonIndex}>
                              <div>{addon.name}</div>
                              <div className="text-gray-500">+{formatCurrency(addon.price)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(item.itemTotal)}
                    </td>
                  </tr>
                ))}
                
                {/* Extra Items */}
                {order.extraItems && order.extraItems.length > 0 && (
                  <>
                    <tr className="bg-blue-50">
                      <td colSpan="6" className="px-4 py-2 text-sm font-medium text-blue-800">
                        Extra Items
                      </td>
                    </tr>
                    {order.extraItems.map((extraItem, index) => (
                      <tr key={`extra-${index}`} className="bg-blue-25">
                        <td className="px-4 py-3">
                          <div className="font-medium text-blue-900">+ {extraItem.name}</div>
                          {extraItem.status && (
                            <div className={`text-xs px-2 py-1 rounded inline-block mt-1 ${
                              extraItem.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              extraItem.status === 'PREPARING' ? 'bg-orange-100 text-orange-800' :
                              extraItem.status === 'READY' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {extraItem.status}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatCurrency(extraItem.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {extraItem.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">-</td>
                        <td className="px-4 py-3 text-sm text-gray-900">-</td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-900">
                          {formatCurrency(extraItem.total)}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="5" className="px-4 py-2 text-right text-sm text-gray-600">
                    Subtotal:
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {formatCurrency(order.subtotal || order.totalAmount)}
                  </td>
                </tr>
                {order.discount && order.discount.amount > 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 text-right text-sm text-gray-600">
                      Discount ({order.discount.percentage}%):
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-red-600">
                      -{formatCurrency(order.discount.amount)}
                    </td>
                  </tr>
                )}
                {(order.gst > 0 || order.sgst > 0) && (
                  <>
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-right text-sm text-gray-600">
                        GST (2.5%):
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {formatCurrency(order.gst || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-right text-sm text-gray-600">
                        SGST (2.5%):
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {formatCurrency(order.sgst || 0)}
                      </td>
                    </tr>
                  </>
                )}
                <tr className="border-t-2 border-gray-300">
                  <td colSpan="5" className="px-4 py-3 text-right font-bold text-gray-900">
                    Total Amount:
                  </td>
                  <td className="px-4 py-3 text-lg font-bold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
