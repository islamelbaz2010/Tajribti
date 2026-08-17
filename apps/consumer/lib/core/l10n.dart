import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

const String _kLangKey = 'app_lang';

// ── Language state ────────────────────────────────────────────────────────────

class LangNotifier extends ValueNotifier<bool> {
  LangNotifier() : super(true); // true = Arabic default

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    value = prefs.getBool(_kLangKey) ?? true;
  }

  Future<void> setArabic(bool ar) async {
    value = ar;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kLangKey, ar);
  }

  void toggle() => setArabic(!value);
}

final langNotifier = LangNotifier();

// ── InheritedWidget ───────────────────────────────────────────────────────────

class LangProvider extends InheritedNotifier<LangNotifier> {
  LangProvider({super.key, required super.child})
      : super(notifier: langNotifier);

  static bool isAr(BuildContext context) {
    context.dependOnInheritedWidgetOfExactType<LangProvider>();
    return langNotifier.value;
  }
}

// ── Context extension ─────────────────────────────────────────────────────────

extension L10nContext on BuildContext {
  AppStr get l10n => AppStr(LangProvider.isAr(this));
  TextDirection get dir => LangProvider.isAr(this) ? TextDirection.rtl : TextDirection.ltr;
}

// ── String definitions ────────────────────────────────────────────────────────

class AppStr {
  final bool ar;
  const AppStr(this.ar);

  String get appName        => ar ? 'تجربتي'   : 'Tajribti';
  TextDirection get dir     => ar ? TextDirection.rtl : TextDirection.ltr;
  bool get isRtl            => ar;

  // ── Language toggle ────────────────────────────────────────────────────────
  String get switchToOther  => ar ? 'EN' : 'ع';

  // ── Scanner ───────────────────────────────────────────────────────────────
  String get scanTitle      => ar ? 'مسح رمز QR'          : 'Scan QR Code';
  String get scanHint       => ar ? 'ضع رمز QR داخل الإطار' : 'Place QR code inside the frame';
  String get scanSub        => ar ? 'سيتم التعرف عليه تلقائياً' : 'It will be detected automatically';
  String get scanError      => ar ? 'رمز غير معروف. تأكد من مسح الرمز الصحيح.' : 'Unknown QR code. Make sure to scan the correct code.';
  String get scanAnother    => ar ? 'مسح رمز آخر'          : 'Scan another code';

  // ── Campaign ──────────────────────────────────────────────────────────────
  String get howItWorks     => ar ? 'كيف يعمل؟'                   : 'How it works';
  String get step1          => ar ? 'سجّل برقم هاتفك'              : 'Register with your phone';
  String get step2          => ar ? 'أجب على أسئلة قصيرة'         : 'Answer a few short questions';
  String get step3          => ar ? 'واحصل على نقاطك'             : 'Earn your reward points';
  String rewardPoints(int n)=> ar ? '$n نقطة مكافأة'              : '$n reward points';
  String get rewardDetail   => ar ? 'عند إتمام التجربة'           : 'on completing the trial';
  String get startTrial     => ar ? 'ابدأ التجربة'                 : 'Start the Trial';
  String get campaignError  => ar ? 'تعذر تحميل بيانات الحملة'    : 'Could not load campaign';
  String get campaignNotFound=> ar ? 'لم يتم التعرف على الحملة'   : 'Campaign not recognized';
  String get entryError     => ar ? 'تعذر الدخول إلى الحملة. حاول مرة أخرى.' : 'Could not enter campaign. Please try again.';

  // ── Phone ─────────────────────────────────────────────────────────────────
  String get welcome        => ar ? 'مرحباً بك'                   : 'Welcome';
  String get phoneSubtitle  => ar ? 'أدخل رقم هاتفك لتلقّي رمز التحقق' : 'Enter your phone number to receive a verification code';
  String get phoneCampaignBanner => ar ? 'سجّل برقم هاتفك لإتمام تجربتك' : 'Register with your phone to complete your trial';
  String get phoneLabel     => ar ? 'رقم الهاتف'                  : 'Phone Number';
  String get phoneExample   => ar ? 'مثال: +201012345678'         : 'Example: +201012345678';
  String get sendCode       => ar ? 'إرسال الرمز'                 : 'Send Code';
  String get phoneError     => ar ? 'أدخل رقم هاتف مصري صحيح (+201XXXXXXXXX)' : 'Enter a valid Egyptian phone number (+201XXXXXXXXX)';
  String get sendError      => ar ? 'تعذر الإرسال. تحقق من اتصالك بالإنترنت.' : 'Send failed. Check your internet connection.';

  // ── OTP ───────────────────────────────────────────────────────────────────
  String get otpTitle       => ar ? 'أدخل رمز التحقق'             : 'Enter Verification Code';
  String get otpSentTo      => ar ? 'تم إرسال رمز مكون من 6 أرقام إلى' : 'A 6-digit code was sent to';
  String get preparingCode  => ar ? 'جارٍ تجهيز رمز التحقق…'     : 'Preparing verification…';
  String get otpWrong       => ar ? 'رمز غير صحيح. تحقق من الرمز وأعد المحاولة.' : 'Incorrect code. Check and try again.';
  String get otpExpired     => ar ? 'انتهت صلاحية الرمز. اطلب رمزاً جديداً.' : 'Code expired. Please request a new one.';
  String get otpTooMany     => ar ? 'محاولات كثيرة. اطلب رمزاً جديداً.' : 'Too many attempts. Please request a new OTP.';
  String get challengeError => ar ? 'تعذر الاتصال بخدمة التحقق. أعد المحاولة.' : 'Could not reach verification service. Please retry.';
  String get didntReceive   => ar ? 'لم يصلك الرمز؟  '            : "Didn't receive the code?  ";
  String get resend         => ar ? 'إعادة الإرسال'               : 'Resend';
  String resendIn(int n)    => ar ? 'إعادة الإرسال خلال ${n}ث'   : 'Resend in ${n}s';
  String get verifying      => ar ? 'جارٍ التحقق…'               : 'Verifying…';
  String get resendFailed   => ar ? 'تعذر إعادة الإرسال. حاول مجدداً.' : 'Resend failed. Please try again.';

  // ── Register ──────────────────────────────────────────────────────────────
  String get oneMoreStep    => ar ? 'خطوة واحدة وتنتهي'           : 'One last step';
  String get tellUsAbout    => ar ? 'أخبرنا عن نفسك'             : 'Tell us about yourself';
  String get forBetterExp   => ar ? 'لنوفر لك تجربة مناسبة'      : 'For a better experience';
  String get nameLabel      => ar ? 'الاسم'                       : 'Name';
  String get nameHint       => ar ? 'اسمك الأول'                  : 'Your first name';
  String get ageLabel       => ar ? 'الفئة العمرية'               : 'Age Group';
  String get genderLabel    => ar ? 'الجنس'                       : 'Gender';
  String get cityLabel      => ar ? 'المدينة'                     : 'City';
  String get continueBtn    => ar ? 'متابعة'                      : 'Continue';
  String get fillAll        => ar ? 'يرجى إكمال جميع الحقول'     : 'Please complete all fields';
  String get saveError      => ar ? 'تعذر حفظ البيانات. حاول مرة أخرى.' : 'Could not save data. Please try again.';

  List<String> get ageRanges => const ['18-24', '25-34', '35-44', '45-54', '55+'];
  List<String> get genders   => ar ? ['ذكر', 'أنثى'] : ['Male', 'Female'];
  List<String> get genderValues => const ['male', 'female'];
  List<String> get cities    => ar
      ? ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'أخرى']
      : ['Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Other'];
  List<String> get cityValues => const ['Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Other'];

  // ── Survey ────────────────────────────────────────────────────────────────
  String get submitAnswers  => ar ? 'إرسال الإجابات'              : 'Submit Answers';
  String get nextQuestion   => ar ? 'التالي'                      : 'Next';
  String get optional       => ar ? '(اختياري)'                   : '(optional)';
  String get writeOpinion   => ar ? 'اكتب رأيك هنا…'             : 'Write your opinion here…';
  String get surveyError    => ar ? 'تعذر تحميل الاستبيان'        : 'Could not load the survey';
  String get submitError    => ar ? 'تعذر إرسال الإجابات. حاول مرة أخرى.' : 'Could not send answers. Please try again.';
  String get scaleUnlikely  => ar ? 'غير محتمل'                   : 'Unlikely';
  String get scaleLikely    => ar ? 'محتمل جداً'                  : 'Very likely';
  String surveyProgress(int cur, int total) => '$cur / $total';

  // ── Thank You ─────────────────────────────────────────────────────────────
  String get thankYou       => ar ? 'شكراً لك!'                   : 'Thank You!';
  String get feedbackSent   => ar ? 'تم إرسال رأيك بنجاح'        : 'Your feedback was sent successfully';
  String get pointsAddedLabel => ar ? 'نقطة أُضيفت لحسابك'        : 'points added to your account';
  String get backHome       => ar ? 'العودة للرئيسية'             : 'Back to Home';

  // ── Home ──────────────────────────────────────────────────────────────────
  String get homeTitle      => ar ? 'تجربتي'                      : 'Tajribti';
  String get homeReady      => ar ? 'جاهز لتجربة جديدة؟'         : 'Ready for a new trial?';
  String get homeSub        => ar ? 'امسح رمز QR على المنتج لتبدأ تجربتك وتشارك رأيك' : 'Scan the QR code on the product to start your trial and share your feedback';
  String get scanQr         => ar ? 'مسح QR'                      : 'Scan QR';
  String get logout         => ar ? 'تسجيل الخروج'               : 'Sign Out';

  // ── General ───────────────────────────────────────────────────────────────
  String get retry          => ar ? 'إعادة المحاولة'              : 'Try Again';
  String get loading        => ar ? 'جارٍ التحميل…'              : 'Loading…';
  String get networkError   => ar ? 'خطأ في الاتصال'              : 'Connection error';
}
