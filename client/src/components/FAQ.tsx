import { ChevronDown } from "lucide-react";
import { useState } from "react";

/**
 * FAQ Section Component
 * Design: Expandable accordion with smooth animations
 * Features: Common questions about the platform with detailed answers
 */

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "كيف يعمل ConnectLive؟",
    answer:
      "ما عليك سوى فتح الموقع والسماح بالوصول إلى الكاميرا. ثم اضغط على 'ابدأ الدردشة' وسيتم توصيلك بشخص عشوائي في ثوانٍ. لا حاجة للتسجيل أو إنشاء حساب.",
  },
  {
    question: "هل الخدمة مجانية تماماً؟",
    answer:
      "نعم، ConnectLive مجاني تماماً. يمكنك الدردشة بدون حد أقصى للجلسات أو الوقت. لا توجد رسوم مخفية أو اشتراكات.",
  },
  {
    question: "هل بياناتي آمنة وخاصة؟",
    answer:
      "نعم، نحن نحافظ على خصوصيتك بجدية. جميع الاتصالات مشفرة، ولا نحتفظ بسجلات الفيديو. لا يتم مشاركة أي معلومات شخصية بينك وبين الشخص الآخر.",
  },
  {
    question: "ما هو الحد الأدنى للعمر؟",
    answer:
      "يجب أن تكون بعمر 18 سنة أو أكثر لاستخدام المنصة. هذا لضمان بيئة آمنة وملائمة للجميع.",
  },
  {
    question: "ماذا لو واجهت شخصاً غير لائق؟",
    answer:
      "يمكنك حظر أو الإبلاغ عن أي مستخدم بضغطة زر واحدة. فريقنا يراجع جميع التقارير ويتخذ إجراءات صارمة ضد المستخدمين المخالفين.",
  },
  {
    question: "هل يمكنني استخدام التطبيق على هاتفي؟",
    answer:
      "نعم، ConnectLive متاح على iOS و Android. يمكنك أيضاً استخدامه على الويب من أي متصفح حديث.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            الأسئلة <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">الشائعة</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            إجابات على أسئلتك الشائعة حول كيفية استخدام ConnectLive
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
              >
                <span className="font-bold text-lg text-gray-900 text-right flex-1">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-purple-600 ml-4 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            هل لديك سؤال آخر؟ <span className="text-purple-600 font-semibold">تواصل معنا</span>
          </p>
          <button className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-8 rounded-full hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl">
            اتصل بنا الآن
          </button>
        </div>
      </div>
    </section>
  );
}
