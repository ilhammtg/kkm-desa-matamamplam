import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Faq } from "@prisma/client";

interface FAQSectionProps {
  faqs: Faq[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
    if (faqs.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Pertanyaan Umum</h2>
            <p className="text-gray-500 md:text-lg">
                Beberapa pertanyaan yang sering ditanyakan seputar KKM kami.
            </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left font-medium text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
