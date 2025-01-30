import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Custom toast configurations
const showSuccessToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-purple-600 hover:text-purple-500 focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  ));
};

const showErrorToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <XCircle className="h-6 w-6 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  ));
};

const showLoadingToast = (message) => {
  return toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
        </div>
      </div>
    </div>
  ), { duration: Infinity });
};

// Toast container component
const ToastContainer = () => (
  <Toaster
    position="top-right"
    reverseOrder={false}
    toastOptions={{
      duration: 5000,
      className: 'custom-toast',
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
      },
    }}
  />
);

export { ToastContainer, showSuccessToast, showErrorToast, showLoadingToast };