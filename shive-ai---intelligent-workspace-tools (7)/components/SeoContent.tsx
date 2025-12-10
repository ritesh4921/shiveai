import React from 'react';

interface SeoContentProps {
  title: string;
  content: string;
}

export const SeoContent: React.FC<SeoContentProps> = ({ title, content }) => {
  return (
    <div className="mt-16 border-t border-slate-200 pt-12 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">{title}</h2>
        <article className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
          {content.split('\n').map((paragraph, idx) => {
            // Simple markdown-like parsing for headers in the description
            if (paragraph.trim().startsWith('**')) {
               return <p key={idx} className="font-bold text-slate-800 mt-4">{paragraph.replace(/\*\*/g, '')}</p>;
            }
            return <p key={idx} className="mb-4">{paragraph.replace(/\*\*/g, '')}</p>;
          })}
        </article>
        
        <div className="mt-10 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200 rounded-full -mr-8 -mt-8 opacity-20" />
          <h3 className="text-base font-bold text-indigo-900 uppercase tracking-wider mb-4 relative z-10">Why use Shive AI?</h3>
          <ul className="grid sm:grid-cols-2 gap-3 relative z-10">
            {['100% Free', 'No Registration Required', 'Secure Client-Side Processing', 'Mobile Friendly Design', 'Instant Results', 'No Watermarks'].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-indigo-800 font-medium">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};