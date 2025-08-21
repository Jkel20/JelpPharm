// Safe class utility system to prevent Tailwind CSS runtime errors

// Color mapping for consistent, safe class generation
export const colors = {
  primary: {
    50: 'bg-primary-50',
    100: 'bg-primary-100',
    200: 'bg-primary-200',
    300: 'bg-primary-300',
    400: 'bg-primary-400',
    500: 'bg-primary-500',
    600: 'bg-primary-600',
    700: 'bg-primary-700',
    800: 'bg-primary-800',
    900: 'bg-primary-900',
  },
  secondary: {
    50: 'bg-secondary-50',
    100: 'bg-secondary-100',
    200: 'bg-secondary-200',
    300: 'bg-secondary-300',
    400: 'bg-secondary-400',
    500: 'bg-secondary-500',
    600: 'bg-secondary-600',
    700: 'bg-secondary-700',
    800: 'bg-secondary-800',
    900: 'bg-secondary-900',
  },
  success: {
    50: 'bg-success-50',
    100: 'bg-success-100',
    200: 'bg-success-200',
    300: 'bg-success-300',
    400: 'bg-success-400',
    500: 'bg-success-500',
    600: 'bg-success-600',
    700: 'bg-success-700',
    800: 'bg-success-800',
    900: 'bg-success-900',
  },
  warning: {
    50: 'bg-warning-50',
    100: 'bg-warning-100',
    200: 'bg-warning-200',
    300: 'bg-warning-300',
    400: 'bg-warning-400',
    500: 'bg-warning-500',
    600: 'bg-warning-600',
    700: 'bg-warning-700',
    800: 'bg-warning-800',
    900: 'bg-warning-900',
  },
  error: {
    50: 'bg-error-50',
    100: 'bg-error-100',
    200: 'bg-error-200',
    300: 'bg-error-300',
    400: 'bg-error-400',
    500: 'bg-error-500',
    600: 'bg-error-600',
    700: 'bg-error-700',
    800: 'bg-error-800',
    900: 'bg-error-900',
  },
  gray: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
  }
};

// Text color mapping
export const textColors = {
  primary: {
    50: 'text-primary-50',
    100: 'text-primary-100',
    200: 'text-primary-200',
    300: 'text-primary-300',
    400: 'text-primary-400',
    500: 'text-primary-500',
    600: 'text-primary-600',
    700: 'text-primary-700',
    800: 'text-primary-800',
    900: 'text-primary-900',
  },
  secondary: {
    50: 'text-secondary-50',
    100: 'text-secondary-100',
    200: 'text-secondary-200',
    300: 'text-secondary-300',
    400: 'text-secondary-400',
    500: 'text-secondary-500',
    600: 'text-secondary-600',
    700: 'text-secondary-700',
    800: 'text-secondary-800',
    900: 'text-secondary-900',
  },
  success: {
    50: 'text-success-50',
    100: 'text-success-100',
    200: 'text-success-200',
    300: 'text-success-300',
    400: 'text-success-400',
    500: 'text-success-500',
    600: 'text-success-600',
    700: 'text-success-700',
    800: 'text-success-800',
    900: 'text-success-900',
  },
  warning: {
    50: 'text-warning-50',
    100: 'text-warning-100',
    200: 'text-warning-200',
    300: 'text-warning-300',
    400: 'text-warning-400',
    500: 'text-warning-500',
    600: 'text-warning-600',
    700: 'text-warning-700',
    800: 'text-warning-800',
    900: 'text-warning-900',
  },
  error: {
    50: 'text-error-50',
    100: 'text-error-100',
    200: 'text-error-200',
    300: 'text-error-300',
    400: 'text-error-400',
    500: 'text-error-500',
    600: 'text-error-600',
    700: 'text-error-700',
    800: 'text-error-800',
    900: 'text-error-900',
  },
  gray: {
    50: 'text-gray-50',
    100: 'text-gray-100',
    200: 'text-gray-200',
    300: 'text-gray-300',
    400: 'text-gray-400',
    500: 'text-gray-500',
    600: 'text-gray-600',
    700: 'text-gray-700',
    800: 'text-gray-800',
    900: 'text-gray-900',
  }
};

// Border color mapping
export const borderColors = {
  primary: {
    50: 'border-primary-50',
    100: 'border-primary-100',
    200: 'border-primary-200',
    300: 'border-primary-300',
    400: 'border-primary-400',
    500: 'border-primary-500',
    600: 'border-primary-600',
    700: 'border-primary-700',
    800: 'border-primary-800',
    900: 'border-primary-900',
  },
  secondary: {
    50: 'border-secondary-50',
    100: 'border-secondary-100',
    200: 'border-secondary-200',
    300: 'border-secondary-300',
    400: 'border-secondary-400',
    500: 'border-secondary-500',
    600: 'border-secondary-600',
    700: 'border-secondary-700',
    800: 'border-secondary-800',
    900: 'border-secondary-900',
  },
  success: {
    50: 'border-success-50',
    100: 'border-success-100',
    200: 'border-success-200',
    300: 'border-success-300',
    400: 'border-success-400',
    500: 'border-success-500',
    600: 'border-success-600',
    700: 'border-success-700',
    800: 'border-success-800',
    900: 'border-success-900',
  },
  warning: {
    50: 'border-warning-50',
    100: 'border-warning-100',
    200: 'border-warning-200',
    300: 'border-warning-300',
    400: 'border-warning-400',
    500: 'border-warning-500',
    600: 'border-warning-600',
    700: 'border-warning-700',
    800: 'border-warning-800',
    900: 'border-warning-900',
  },
  error: {
    50: 'border-error-50',
    100: 'border-error-100',
    200: 'border-error-200',
    300: 'border-error-300',
    400: 'border-error-400',
    500: 'border-error-500',
    600: 'border-error-600',
    700: 'border-error-700',
    800: 'border-error-800',
    900: 'border-error-900',
  },
  gray: {
    50: 'border-gray-50',
    100: 'border-gray-100',
    200: 'border-gray-200',
    300: 'border-gray-300',
    400: 'border-gray-400',
    500: 'border-gray-500',
    600: 'border-gray-600',
    700: 'border-gray-700',
    800: 'border-gray-800',
    900: 'border-gray-900',
  }
};

// Gradient mapping
export const gradients = {
  primary: {
    '50-to-100': 'bg-gradient-to-r from-primary-50 to-primary-100',
    '100-to-200': 'bg-gradient-to-r from-primary-100 to-primary-200',
    '200-to-300': 'bg-gradient-to-r from-primary-200 to-primary-300',
    '300-to-400': 'bg-gradient-to-r from-primary-300 to-primary-400',
    '400-to-500': 'bg-gradient-to-r from-primary-400 to-primary-500',
    '500-to-600': 'bg-gradient-to-r from-primary-500 to-primary-600',
    '600-to-700': 'bg-gradient-to-r from-primary-600 to-primary-700',
    '700-to-800': 'bg-gradient-to-r from-primary-700 to-primary-800',
    '800-to-900': 'bg-gradient-to-r from-primary-800 to-primary-900',
  },
  blue: {
    '500-to-600': 'bg-gradient-to-r from-blue-500 to-blue-600',
    '500-to-700': 'bg-gradient-to-r from-blue-500 to-blue-700',
    '600-to-700': 'bg-gradient-to-r from-blue-600 to-blue-700',
  },
  green: {
    '500-to-600': 'bg-gradient-to-r from-green-500 to-green-600',
    '500-to-700': 'bg-gradient-to-r from-green-500 to-green-700',
    '500-to-emerald-600': 'bg-gradient-to-r from-green-500 to-emerald-600',
    '500-to-emerald-700': 'bg-gradient-to-r from-green-500 to-emerald-700',
  },
  purple: {
    '500-to-600': 'bg-gradient-to-r from-purple-500 to-purple-600',
    '500-to-700': 'bg-gradient-to-r from-purple-500 to-purple-700',
    '500-to-violet-600': 'bg-gradient-to-r from-purple-500 to-violet-600',
    '500-to-violet-700': 'bg-gradient-to-r from-purple-500 to-violet-700',
  },
  orange: {
    '500-to-600': 'bg-gradient-to-r from-orange-500 to-orange-600',
    '500-to-700': 'bg-gradient-to-r from-orange-500 to-orange-700',
    '500-to-red-600': 'bg-gradient-to-r from-orange-500 to-red-600',
    '500-to-red-700': 'bg-gradient-to-r from-orange-500 to-red-700',
  },
  red: {
    '500-to-600': 'bg-gradient-to-r from-red-500 to-red-600',
    '500-to-700': 'bg-gradient-to-r from-red-500 to-red-700',
    '500-to-pink-600': 'bg-gradient-to-r from-red-500 to-pink-600',
    '500-to-pink-700': 'bg-gradient-to-r from-red-500 to-pink-700',
  },
  gray: {
    '500-to-600': 'bg-gradient-to-r from-gray-500 to-gray-600',
    '500-to-700': 'bg-gradient-to-r from-gray-500 to-gray-700',
    '500-to-slate-600': 'bg-gradient-to-r from-gray-500 to-slate-600',
    '500-to-slate-700': 'bg-gradient-to-r from-gray-500 to-slate-700',
  }
};

// Status mapping
export const statusColors = {
  success: {
    bg: 'bg-success-100',
    text: 'text-success-800',
    border: 'border-success-200',
    icon: 'text-success-600',
    button: 'bg-success-600 hover:bg-success-700 text-white'
  },
  warning: {
    bg: 'bg-warning-100',
    text: 'text-warning-800',
    border: 'border-warning-200',
    icon: 'text-warning-600',
    button: 'bg-warning-600 hover:bg-warning-700 text-white'
  },
  error: {
    bg: 'bg-error-100',
    text: 'text-error-800',
    border: 'border-error-200',
    icon: 'text-error-600',
    button: 'bg-error-600 hover:bg-error-700 text-white'
  },
  info: {
    bg: 'bg-primary-100',
    text: 'text-primary-800',
    border: 'border-primary-200',
    icon: 'text-primary-600',
    button: 'bg-primary-600 hover:bg-primary-700 text-white'
  }
};

// Safe class combination utility
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Safe conditional class utility
export const conditionalClass = (condition: boolean, trueClass: string, falseClass: string = ''): string => {
  return condition ? trueClass : falseClass;
};

// Safe dynamic class utility with fallback
export const safeClass = (classMap: Record<string, string>, key: string, fallback: string = ''): string => {
  return classMap[key] || fallback;
};
