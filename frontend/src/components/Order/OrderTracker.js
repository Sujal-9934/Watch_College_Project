import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import {
  CheckCircleIcon as CheckCircleOutlineIcon,
  ClockIcon as ClockOutlineIcon,
} from '@heroicons/react/24/outline';

const OrderTracker = ({ order }) => {
  // Define tracking steps with status mapping
  const trackingSteps = [
    {
      id: 'pending',
      label: 'Order Placed',
      description: 'Your order has been placed successfully',
      icon: ClockOutlineIcon,
      completedIcon: CheckCircleIcon,
      color: 'blue',
    },
    {
      id: 'confirmed',
      label: 'Order Confirmed',
      description: 'Your order has been confirmed',
      icon: CheckCircleOutlineIcon,
      completedIcon: CheckCircleIcon,
      color: 'purple',
    },
    {
      id: 'processing',
      label: 'Processing',
      description: 'Your order is being prepared',
      icon: ClockOutlineIcon,
      completedIcon: CheckCircleIcon,
      color: 'yellow',
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description: 'Your order is on the way',
      icon: TruckIcon,
      completedIcon: TruckIcon,
      color: 'blue',
    },
    {
      id: 'delivered',
      label: 'Delivered',
      description: 'Your order has been delivered',
      icon: CheckCircleIcon,
      completedIcon: CheckCircleIcon,
      color: 'green',
    },
  ];

  // Get status index
  const getStatusIndex = (status) => {
    const statusMap = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: -1,
      refunded: -1,
    };
    return statusMap[status] || 0;
  };

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    if (order.estimated_delivery_date) {
      return new Date(order.estimated_delivery_date);
    }
    // Default: 5-7 days from order date
    const orderDate = new Date(order.created_at);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + 5);
    return estimatedDate;
  };

  const estimatedDelivery = getEstimatedDelivery();
  const isDelivered = order.status === 'delivered';
  const deliveredDate = order.delivered_at ? new Date(order.delivered_at) : null;

  // Get location based on status
  const getLocation = () => {
    switch (order.status) {
      case 'pending':
      case 'confirmed':
        return 'Warehouse - Preparing';
      case 'processing':
        return 'Warehouse - Packaging';
      case 'shipped':
        return order.tracking_number ? 'In Transit' : 'Dispatched';
      case 'delivered':
        return order.shipping_address
          ? `${order.shipping_address.city}, ${order.shipping_address.state}`
          : 'Delivered';
      default:
        return 'Processing';
    }
  };

  // Get time for each status
  const getStatusTime = (status) => {
    switch (status) {
      case 'pending':
        return order.created_at;
      case 'confirmed':
        return order.updated_at; // Approximate
      case 'processing':
        return order.updated_at; // Approximate
      case 'shipped':
        return order.updated_at; // Approximate
      case 'delivered':
        return order.delivered_at || order.updated_at;
      default:
        return null;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isCancelled) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Order {order.status === 'cancelled' ? 'Cancelled' : 'Refunded'}
            </h3>
            <p className="text-gray-600">
              {order.cancelled_at
                ? `On ${formatDateTime(order.cancelled_at)}`
                : 'This order has been cancelled'}
            </p>
            {order.cancelled_reason && (
              <p className="text-gray-500 mt-2 text-sm">Reason: {order.cancelled_reason}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <TruckIcon className="h-6 w-6 mr-2 text-primary-600" />
          Order Tracking
        </h2>
        <p className="text-gray-600">
          Track your order #{order.order_number} in real-time
        </p>
      </div>

      {/* Current Status Card */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 mb-6 border-2 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Status</p>
            <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">
              {order.status === 'shipped' ? 'On The Way' : order.status}
            </h3>
            <p className="text-gray-600 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {getLocation()}
            </p>
          </div>
          <div className="text-right">
            {order.tracking_number && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-mono font-bold text-primary-600">{order.tracking_number}</p>
              </div>
            )}
            {isDelivered && deliveredDate ? (
              <p className="text-sm text-green-600 font-semibold">
                Delivered on {formatDateTime(deliveredDate)}
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Est. Delivery: {formatDateTime(estimatedDelivery)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
          <div
            className={`absolute top-0 left-0 w-full transition-all duration-500 ${
              isDelivered ? 'bg-green-500' : 'bg-primary-500'
            }`}
            style={{
              height: `${(currentStatusIndex / (trackingSteps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {trackingSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const Icon = isCompleted ? step.completedIcon : step.icon;
            const statusTime = getStatusTime(step.id);

            return (
              <div key={step.id} className="relative flex items-start">
                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-300 ${
                    isCompleted
                      ? step.color === 'blue'
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110'
                        : step.color === 'purple'
                        ? 'bg-purple-500 border-purple-500 text-white shadow-lg scale-110'
                        : step.color === 'yellow'
                        ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg scale-110'
                        : 'bg-green-500 border-green-500 text-white shadow-lg scale-110'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="ml-6 flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4
                        className={`text-lg font-bold mb-1 ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p
                        className={`text-sm mb-2 ${
                          isCompleted ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {step.description}
                      </p>
                      {isCurrent && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold animate-pulse">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          In Progress
                        </div>
                      )}
                      {isCompleted && statusTime && (
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDateTime(statusTime)}
                        </p>
                      )}
                    </div>
                    {isCurrent && order.status === 'shipped' && (
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          <TruckIcon className="h-3 w-3 mr-1" />
                          In Transit
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Information */}
      {isDelivered && deliveredDate && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-green-50 rounded-lg p-4 flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <h4 className="font-bold text-green-900">Order Delivered Successfully!</h4>
              <p className="text-sm text-green-700">
                Your order was delivered on {formatDateTime(deliveredDate)}
              </p>
              {order.shipping_address && (
                <p className="text-sm text-green-600 mt-1">
                  Delivered to: {order.shipping_address.address}, {order.shipping_address.city}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-primary-600" />
            Delivery Address
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">
              {order.shipping_address.first_name} {order.shipping_address.last_name}
            </p>
            <p className="text-gray-600">{order.shipping_address.address}</p>
            <p className="text-gray-600">
              {order.shipping_address.city}, {order.shipping_address.state} -{' '}
              {order.shipping_address.zip_code}
            </p>
            <p className="text-gray-600">{order.shipping_address.country}</p>
            {order.shipping_address.phone && (
              <p className="text-gray-600 mt-2">Phone: {order.shipping_address.phone}</p>
            )}
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3">Order Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Order Date</p>
            <p className="font-semibold text-gray-900">{formatDateTime(order.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-600">Order Total</p>
            <p className="font-semibold text-gray-900">
              ₹{parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Payment Method</p>
            <p className="font-semibold text-gray-900 capitalize">{order.payment_method}</p>
          </div>
          <div>
            <p className="text-gray-600">Payment Status</p>
            <p
              className={`font-semibold ${
                order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}
            >
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
