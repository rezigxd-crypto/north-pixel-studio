import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/lib/context";

export const TermsModal = ({ onAgree, agreed, onChange }: {
  onAgree?: () => void;
  agreed: boolean;
  onChange: (v: boolean) => void;
}) => {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id="terms"
        checked={agreed}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 accent-accent cursor-pointer"
      />
      <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
        {t("termsAgree")}{" "}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button type="button" className="text-accent underline hover:text-accent/80 font-medium">
              {t("termsLink")}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{t("termsTitle")}</DialogTitle>
            </DialogHeader>
            <div className={`space-y-4 text-sm text-muted-foreground leading-relaxed ${lang === "ar" ? "text-right" : ""}`}>

              {lang === "ar" ? (
                <>
                  <p className="text-foreground font-semibold text-base">الإطار القانوني — الجمهورية الجزائرية الديمقراطية الشعبية</p>

                  <p>بناءً على أحكام <strong className="text-foreground">الدستور الجزائري لعام 2020</strong>، لا سيما المادتين 38 و39 المتعلقتين بالحرية الإبداعية وحماية حقوق الملكية الفكرية، وبناءً على:</p>

                  <ul className="space-y-2 list-none">
                    <li>• <strong className="text-foreground">الأمر 03-05</strong> المؤرخ في 19 يوليو 2003 المتعلق بحقوق المؤلف والحقوق المجاورة</li>
                    <li>• <strong className="text-foreground">القانون 14-04</strong> المتعلق بالنشاط السمعي البصري</li>
                    <li>• <strong className="text-foreground">القانون 04-18</strong> المتعلق بالوقاية من الجرائم المتصلة بتكنولوجيات المعلومات والاتصال</li>
                    <li>• <strong className="text-foreground">المرسوم التنفيذي 95-163</strong> المتعلق بحماية المصنفات الفنية والأدبية</li>
                  </ul>

                  <div className="glass rounded-xl p-4 border border-accent/20">
                    <p className="text-foreground font-semibold mb-2">⚖️ حقوق الصورة والصوت</p>
                    <p>لا يُسمح باستخدام أو نشر أو توزيع أي محتوى صوتي أو بصري دون الحصول على إذن مسبق وصريح من أصحاب الحقوق. يشمل ذلك:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• تصوير أشخاص دون موافقتهم الخطية</li>
                      <li>• استخدام تسجيلات صوتية أو موسيقى دون ترخيص</li>
                      <li>• نشر محتوى يمس بكرامة الأشخاص أو المؤسسات</li>
                      <li>• انتهاك حقوق الملكية الفكرية لأي جهة كانت</li>
                    </ul>
                  </div>

                  <div className="glass rounded-xl p-4 border border-accent/20">
                    <p className="text-foreground font-semibold mb-2">📋 التزامات المستخدم</p>
                    <ul className="space-y-1">
                      <li>• تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
                      <li>• احترام حقوق المبدعين والعملاء على المنصة</li>
                      <li>• عدم نشر محتوى مخالف للقانون الجزائري أو الآداب العامة</li>
                      <li>• الالتزام بالمواعيد والاتفاقيات المبرمة عبر المنصة</li>
                      <li>• الإفصاح عن أي تعارض في المصالح</li>
                    </ul>
                  </div>

                  <div className="glass rounded-xl p-4 border border-destructive/20">
                    <p className="text-foreground font-semibold mb-2">🚫 المحتوى المحظور</p>
                    <p>يُحظر نشر أي محتوى يتضمن:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• ما يمس بالوحدة الوطنية أو الرموز الوطنية</li>
                      <li>• محتوى يحرض على العنف أو التمييز</li>
                      <li>• انتهاك الخصوصية أو القذف والتشهير</li>
                      <li>• المحتوى الإباحي أو المسيء</li>
                    </ul>
                  </div>

                  <div className="glass rounded-xl p-4 border border-accent/20">
                    <p className="text-foreground font-semibold mb-2">💰 المعاملات المالية</p>
                    <p>تخضع جميع المعاملات المالية على المنصة لقانون النقد والقرض الجزائري. تحتجز المنصة نسبة <strong className="text-foreground">20%</strong> كعمولة خدمة من كل صفقة.</p>
                  </div>

                  <div className="glass rounded-xl p-4 border border-accent/20">
                    <p className="text-foreground font-semibold mb-2">🔒 حماية البيانات الشخصية</p>
                    <p>تلتزم المنصة بحماية بياناتك الشخصية وفق <strong className="text-foreground">القانون 18-07</strong> المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة البيانات ذات الطابع الشخصي.</p>
                  </div>

                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    بالنقر على "موافق"، تقر بأنك قرأت وفهمت وقبلت جميع الشروط والأحكام المذكورة أعلاه. تحتفظ North Pixel Studio بحق تعديل هذه الشروط في أي وقت مع إشعار مسبق.
                  </p>
                </>
              ) : lang === "fr" ? (
                <>
                  <p className="text-foreground font-semibold text-base">Cadre Légal — République Algérienne Démocratique et Populaire</p>
                  <p>Conformément à la <strong className="text-foreground">Constitution algérienne de 2020</strong>, notamment les articles 38 et 39 relatifs à la liberté créative et à la protection des droits de propriété intellectuelle, et en vertu de l'Ordonnance 03-05 relative aux droits d'auteur et droits voisins.</p>
                  <div className="glass rounded-xl p-4 border border-accent/20">
                    <p className="text-foreground font-semibold mb-2">⚖️ Droits à l'image et au son</p>
                    <p>Toute utilisation de contenu audio-visuel sans autorisation préalable est strictement interdite. Cela inclut la prise de vue de personnes sans leur consentement écrit et l'utilisation d'enregistrements sans licence.</p>
                  </div>
                  <div className="glass rounded-xl p-4 border border-accent/20">
                    <p className="text-foreground font-semibold mb-2">💰 Transactions financières</p>
                    <p>La plateforme retient <strong className="text-foreground">20%</strong> de commission sur chaque transaction, conformément à la loi algérienne sur la monnaie et le crédit.</p>
                  </div>
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    En cochant cette case, vous acceptez l'ensemble des conditions d'utilisation.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-foreground font-semibold text-base">Legal Framework — People's Democratic Republic of Algeria</p>
                  <p>Pursuant to the <strong className="text-foreground">Algerian Constitution of 2020</strong>, specifically articles 38 and 39 regarding creative freedom and intellectual property protection, and in accordance with Order 03-05 on copyright and related rights.</p>
                  <div className="glass rounded-xl p-4 border border-accent/20">
                    <p className="text-foreground font-semibold mb-2">⚖️ Image & Sound Rights</p>
                    <p>No audio-visual content may be used, published, or distributed without prior explicit permission from rights holders. This includes photographing individuals without written consent and using audio recordings without a license.</p>
                  </div>
                  <div className="glass rounded-xl p-4 border border-accent/20">
                    <p className="text-foreground font-semibold mb-2">💰 Financial Transactions</p>
                    <p>The platform retains <strong className="text-foreground">20%</strong> commission on each transaction, in compliance with Algerian monetary and credit law.</p>
                  </div>
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    By checking this box, you confirm you have read, understood and accepted all terms and conditions above.
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={() => { onChange(true); setOpen(false); }}
                className="w-full py-3 rounded-xl bg-gradient-royal text-primary-foreground font-semibold mt-4"
              >
                {lang === "ar" ? "أوافق على الشروط" : lang === "fr" ? "J'accepte les conditions" : "I agree to the terms"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </label>
    </div>
  );
};
