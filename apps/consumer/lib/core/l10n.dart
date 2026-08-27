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
  String get scanCampaignMismatch => ar ? 'هذا الرمز يخص حملة أخرى. امسح رمز هذه الحملة.' : 'This code belongs to a different campaign. Scan this campaign\'s QR code.';

  // ── Campaign ──────────────────────────────────────────────────────────────
  String get howItWorks     => ar ? 'كيف يعمل؟'                   : 'How it works';
  String get step1          => ar ? 'امسح رمز QR'                  : 'Scan the QR code';
  String get step2          => ar ? 'تحقق برقم هاتفك'              : 'Verify with your phone';
  String get step3          => ar ? 'واحصل على نقاطك'             : 'Earn your reward points';
  String rewardPoints(int n)=> ar ? '$n نقطة مكافأة'              : '$n reward points';
  String get rewardDetail   => ar ? 'عند إتمام التجربة'           : 'on completing the trial';
  String get startTrial     => ar ? 'ابدأ التجربة'                 : 'Start the Trial';
  String get campaignError  => ar ? 'تعذر تحميل بيانات الحملة'    : 'Could not load campaign';
  String get campaignNotFound=> ar ? 'لم يتم التعرف على الحملة'   : 'Campaign not recognized';
  String get entryError          => ar ? 'تعذر الدخول إلى الحملة. حاول مرة أخرى.' : 'Could not enter campaign. Please try again.';
  String get alreadyParticipated => ar ? 'شاركت سابقاً'                            : 'Already Participated';
  String get alreadyParticipatedSub => ar ? 'شاركت في هذه الحملة من قبل وحصلت على مكافأتك.'  : 'You already participated in this campaign and earned your reward.';

  // ── Account authentication (email + password) ───────────────────────────
  String get welcome        => ar ? 'مرحباً بك'                   : 'Welcome';
  String get authChoiceSubtitle => ar ? 'سجّل الدخول إلى حسابك الحالي، أو أنشئ حساباً جديداً للمتابعة.'
                                       : 'Sign in to your existing account, or create a new one to continue.';
  String get authChoiceCampaignBanner => ar ? 'سجّل الدخول أو أنشئ حساباً لإتمام تجربتك'
                                             : 'Log in or create an account to continue your trial';
  String get createAccount  => ar ? 'إنشاء حساب'                   : 'Sign Up / Create Account';
  String get loginTitle        => ar ? 'تسجيل الدخول'                     : 'Log In';
  String get loginSubtitle     => ar ? 'سجّل الدخول إلى حسابك في تجربتي'  : 'Log in to your Tajribti account';
  String get emailLabel        => ar ? 'البريد الإلكتروني'                : 'Email';
  String get emailHint         => 'example@email.com';
  String get passwordLabel     => ar ? 'كلمة المرور'                     : 'Password';
  String get confirmPasswordLabel => ar ? 'تأكيد كلمة المرور'            : 'Confirm Password';
  String get invalidEmail      => ar ? 'أدخل بريداً إلكترونياً صحيحاً'    : 'Enter a valid email address';
  String get passwordRequirements => ar ? '8 أحرف على الأقل، تتضمن حرفاً ورقماً'
                                         : 'At least 8 characters, including a letter and a number';
  String get passwordMismatch  => ar ? 'كلمتا المرور غير متطابقتين'      : 'Passwords do not match';
  String get loginError        => ar ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password';
  String get signupError       => ar ? 'تعذر إنشاء الحساب. حاول مرة أخرى.' : 'Could not create account. Please try again.';
  String get emailAlreadyExists => ar ? 'يوجد حساب بهذا البريد الإلكتروني بالفعل' : 'An account with this email already exists';
  String get phoneAlreadyExists => ar ? 'يوجد حساب بهذا الرقم بالفعل'    : 'An account with this phone number already exists';
  String get dontHaveAccount   => ar ? 'ليس لديك حساب؟'                  : "Don't have an account?";
  String get alreadyHaveAccount => ar ? 'لديك حساب بالفعل؟'              : 'Already have an account?';
  String get emailNotVerifiedNote => ar ? 'لم يتم تأكيد بريدك الإلكتروني بعد.' : "Your email hasn't been verified yet.";

  // ── Campaign phone verification (NOT account login) ─────────────────────
  String get verifyPhoneTitle => ar ? 'تحقق من رقم هاتفك'          : 'Verify Your Phone';
  String get phoneSubtitle  => ar ? 'أدخل رقم هاتفك لتلقّي رمز التحقق' : 'Enter your phone number to receive a verification code';
  String get phoneCampaignBanner => ar ? 'تحقق برقم هاتفك لإتمام تجربتك' : 'Verify your phone to complete your trial';
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
  String get submitError         => ar ? 'تعذر إرسال الإجابات. حاول مرة أخرى.' : 'Could not send answers. Please try again.';
  String get alreadySubmitted    => ar ? 'تم إرسال إجابتك مسبقاً'              : 'Already Submitted';
  String get alreadySubmittedSub => ar ? 'أرسلت إجاباتك على هذه الاستبانة من قبل.' : 'You have already submitted your answers for this survey.';
  String get scaleUnlikely  => ar ? 'غير محتمل'                   : 'Unlikely';
  String get scaleLikely    => ar ? 'محتمل جداً'                  : 'Very likely';
  String surveyProgress(int cur, int total) => '$cur / $total';

  // ── Thank You ─────────────────────────────────────────────────────────────
  String get thankYou       => ar ? 'شكراً لك!'                   : 'Thank You!';
  String get feedbackSent   => ar ? 'تم إرسال رأيك بنجاح'        : 'Your feedback was sent successfully';
  String get pointsAddedLabel => ar ? 'نقطة أُضيفت لحسابك'        : 'points added to your account';
  String get backHome       => ar ? 'العودة للرئيسية'             : 'Back to Home';

  // ── Home / Discovery ─────────────────────────────────────────────────────
  String get homeTitle          => ar ? 'تجربتي'                            : 'Tajribti';
  String get heroTagline        => ar ? 'جرّب منتجات حقيقية. مجاناً.'        : 'Try real products. For free.';
  String get heroSub            => ar ? 'اكتشف عروضاً قريبة منك، جرّب المنتج، شارك رأيك، واكسب نقاطاً.'
                                       : 'Discover offers near you, try the product, share your opinion, and earn points.';
  String get heroStepDiscover    => ar ? 'اكتشف' : 'Discover';
  String get heroStepTry         => ar ? 'جرّب'   : 'Try';
  String get heroStepShare       => ar ? 'شارك'   : 'Share';
  String get heroStepEarn        => ar ? 'اكسب'   : 'Earn';
  String get availableCampaigns => ar ? 'العروض المتاحة'                    : 'Available Campaigns';
  String get noCampaignsTitle   => ar ? 'لا توجد عروض حالياً'               : 'No campaigns yet';
  String get noCampaignsSub     => ar ? 'ترقّب عروضاً جديدة قريباً'         : 'New campaigns are coming soon';
  String get logout             => ar ? 'تسجيل الخروج'                      : 'Sign Out';
  String get myActivity         => ar ? 'نشاطي السابق'                      : 'My Activity';
  String get welcomeBack        => ar ? 'مرحباً'                            : 'Hello';
  String get pointsLabel        => ar ? 'نقطة'                              : 'pts';
  String get startTrialCard     => ar ? 'جرّب الآن'                         : 'Try Now';
  String get loadError          => ar ? 'تعذّر تحميل البيانات'               : 'Could not load data';
  // kept for screens that still reference these
  String get homeReady          => ar ? 'جاهز لتجربة جديدة؟'               : 'Ready for a new trial?';
  String get homeSub            => ar ? 'امسح رمز QR على المنتج لتبدأ تجربتك وتشارك رأيك' : 'Scan the QR code on the product to start your trial and share your feedback';

  // ── Profile ───────────────────────────────────────────────────────────────
  String get profileTitle    => ar ? 'ملفي الشخصي'               : 'My Profile';
  String get campaignsLabel  => ar ? 'حملة'                       : 'campaigns';
  String get myActivityFull  => ar ? 'نشاطاتي'                   : 'My Activity';
  String get seeAll          => ar ? 'عرض الكل'                  : 'See all';

  // ── Settings ─────────────────────────────────────────────────────────────
  String get settingsTitle   => ar ? 'الإعدادات'                  : 'Settings';
  String get languageLabel   => ar ? 'اللغة'                      : 'Language';
  String get arabicLang      => ar ? 'العربية'                    : 'Arabic';
  String get englishLang     => ar ? 'الإنجليزية'                 : 'English';
  String get accountLabel    => ar ? 'الحساب'                     : 'Account';
  String get signOut         => ar ? 'تسجيل الخروج'               : 'Sign Out';
  String get signOutConfirm  => ar ? 'هل تريد تسجيل الخروج؟'    : 'Sign out of your account?';
  String get cancel          => ar ? 'إلغاء'                      : 'Cancel';

  // ── Activity ──────────────────────────────────────────────────────────────
  String get activityTitle   => ar ? 'نشاطاتي'                   : 'My Activity';
  String get noActivity      => ar ? 'لا يوجد نشاط بعد'          : 'No activity yet';
  String get noActivitySub   => ar ? 'شارك في حملة لتجد نشاطك هنا' : 'Participate in a campaign to see your activity here';
  String get loginToSeeActivity => ar ? 'سجّل الدخول لعرض نشاطك' : 'Sign in to view your activity';
  String get signIn             => ar ? 'تسجيل الدخول'          : 'Sign In';
  String get activityCompleted  => ar ? 'مكتمل'                 : 'Completed';

  // ── Services / About ─────────────────────────────────────────────────────
  String get servicesTitle     => ar ? 'عن تجربتي'                        : 'About Tajribti';
  String get servicesTagline   => ar ? 'منصّة تجربة المنتجات ورأيك'      : 'The product-trial and feedback platform';
  String get servicesIntro     => ar ? 'تجربتي تربطك بعينات مجانية من علامات تجارية حقيقية. تجرّب المنتج، تشارك رأيك الصادق في استبيان قصير، وتحصل على نقاط مقابل وقتك.'
                                       : 'Tajribti connects you with free samples from real brands. Try the product, share your honest opinion in a short survey, and earn points for your time.';
  String get servicesHowItWorks    => ar ? 'كيف تعمل تجربتي'              : 'How Tajribti works';
  String get servicesStepDiscover  => ar ? 'اكتشف عروضاً قريبة منك أو امسح رمز QR في نقطة التفعيل' : 'Discover offers near you, or scan a QR code at an activation point';
  String get servicesStepTry       => ar ? 'جرّب المنتج مجاناً'            : 'Try the product for free';
  String get servicesStepShare     => ar ? 'شارك رأيك في استبيان قصير'    : 'Share your opinion in a short survey';
  String get servicesStepEarn      => ar ? 'اكسب نقاط مكافأة'             : 'Earn reward points';
  String get servicesCategories    => ar ? 'الفئات المتاحة'               : 'What you can try';
  String get servicesCategoriesSub => ar ? 'منتجات استهلاكية سريعة، مستحضرات تجميل، ومنتجات صيدلانية بدون وصفة طبية' : 'FMCG, beauty, and pharma-OTC products';
  String get servicesFooter        => ar ? 'العروض المتاحة تظهر في الصفحة الرئيسية عند إطلاقها من قبل العلامات التجارية الشريكة.' : 'Available offers appear on the Home screen as partner brands launch them.';

  // ── General ───────────────────────────────────────────────────────────────
  String get retry          => ar ? 'إعادة المحاولة'              : 'Try Again';
  String get loading        => ar ? 'جارٍ التحميل…'              : 'Loading…';
  String get networkError   => ar ? 'خطأ في الاتصال'              : 'Connection error';
}
