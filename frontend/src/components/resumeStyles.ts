/**
 * Resume Template Styles
 * Defines CSS classes for different resume templates
 */

export const resumeStyles = {
  modern: {
    container: 'bg-white text-gray-900',
    header: 'text-center mb-8 pb-6 border-b-2 border-blue-600',
    name: 'text-4xl font-bold text-gray-900 mb-2',
    contact: 'text-gray-600 text-sm space-x-4',
    section: 'mb-6',
    sectionTitle: 'text-2xl font-bold text-blue-600 mb-4 pb-2 border-b border-blue-200',
    subsection: 'mb-4',
    subsectionTitle: 'text-lg font-semibold text-gray-800 mb-2',
    text: 'text-gray-700 leading-relaxed',
    list: 'list-disc list-inside text-gray-700 space-y-1',
    skillTag: 'inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2 mb-2',
    date: 'text-gray-500 text-sm italic'
  },
  
  classic: {
    container: 'bg-white text-gray-900 font-serif',
    header: 'text-center mb-8 pb-6 border-b border-gray-300',
    name: 'text-4xl font-bold text-gray-900 mb-2',
    contact: 'text-gray-600 text-sm space-x-4',
    section: 'mb-6',
    sectionTitle: 'text-xl font-bold text-gray-800 mb-3 pb-1 border-b border-gray-300',
    subsection: 'mb-4',
    subsectionTitle: 'text-base font-semibold text-gray-800 mb-1',
    text: 'text-gray-700 leading-relaxed',
    list: 'list-disc list-inside text-gray-700 space-y-1 ml-4',
    skillTag: 'inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm mr-2 mb-2',
    date: 'text-gray-500 text-sm'
  },
  
  creative: {
    container: 'bg-gradient-to-br from-purple-50 to-blue-50 text-gray-900',
    header: 'text-center mb-8 pb-6 border-b-4 border-purple-500',
    name: 'text-4xl font-bold text-purple-700 mb-2',
    contact: 'text-gray-600 text-sm space-x-4',
    section: 'mb-6 bg-white p-4 rounded-lg shadow-sm',
    sectionTitle: 'text-2xl font-bold text-purple-600 mb-4 flex items-center',
    subsection: 'mb-4',
    subsectionTitle: 'text-lg font-semibold text-blue-700 mb-2',
    text: 'text-gray-700 leading-relaxed',
    list: 'list-disc list-inside text-gray-700 space-y-1',
    skillTag: 'inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full text-sm mr-2 mb-2 font-medium',
    date: 'text-gray-500 text-sm font-medium'
  },
  
  minimal: {
    container: 'bg-white text-gray-900',
    header: 'text-center mb-8 pb-4 border-b border-gray-200',
    name: 'text-3xl font-light text-gray-900 mb-2 tracking-wide',
    contact: 'text-gray-500 text-xs space-x-3 uppercase tracking-wider',
    section: 'mb-6',
    sectionTitle: 'text-lg font-light text-gray-800 mb-3 uppercase tracking-widest border-b border-gray-200 pb-1',
    subsection: 'mb-4',
    subsectionTitle: 'text-base font-normal text-gray-800 mb-1',
    text: 'text-gray-600 leading-relaxed text-sm',
    list: 'text-gray-600 space-y-1 text-sm',
    skillTag: 'inline-block px-2 py-0.5 border border-gray-300 text-gray-700 rounded text-xs mr-2 mb-2',
    date: 'text-gray-400 text-xs'
  }
};

export type TemplateType = keyof typeof resumeStyles;

