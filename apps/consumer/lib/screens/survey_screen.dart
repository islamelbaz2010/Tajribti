import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../widgets/star_rating.dart';
import '../widgets/scale_input.dart';
import '../widgets/choice_chip_group.dart';

class SurveyScreen extends StatefulWidget {
  final String redemptionId;
  final String campaignId;
  final int pointsEarned;

  const SurveyScreen({
    super.key,
    required this.redemptionId,
    required this.campaignId,
    required this.pointsEarned,
  });

  @override
  State<SurveyScreen> createState() => _SurveyScreenState();
}

class _SurveyScreenState extends State<SurveyScreen> {
  Campaign? _campaign;
  bool _loadingCampaign = true;
  bool _submitting = false;
  bool _alreadySubmitted = false;
  String? _error;

  int _currentStep = 0;
  final Map<String, dynamic> _answers = {};

  @override
  void initState() {
    super.initState();
    _loadCampaign();
  }

  Future<void> _loadCampaign() async {
    try {
      final campaign = await apiClient.getCampaignById(widget.campaignId);
      setState(() { _campaign = campaign; _loadingCampaign = false; });
    } catch (e) {
      setState(() { _error = '_loadFail'; _loadingCampaign = false; });
    }
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      await apiClient.submitSurvey(
        redemptionId: widget.redemptionId,
        answers: _answers,
      );
      if (!mounted) return;
      context.go('/thankyou', extra: widget.pointsEarned);
    } catch (e) {
      if (e is DioException && e.response?.statusCode == 409) {
        // Survey already submitted — show "Already Submitted" state, do NOT imply a new reward
        if (!mounted) return;
        setState(() { _submitting = false; _alreadySubmitted = true; });
        return;
      }
      setState(() {
        _submitting = false;
        _error = '_submitFail';
      });
    }
  }

  void _next() {
    final questions = _campaign!.surveyQuestions;
    if (_currentStep < questions.length - 1) {
      setState(() => _currentStep++);
    } else {
      _submit();
    }
  }

  bool _canProceed() {
    final questions = _campaign?.surveyQuestions ?? [];
    if (questions.isEmpty) return false;
    final q = questions[_currentStep];
    if (!q.required) return true;
    return _answers[q.id] != null && _answers[q.id].toString().isNotEmpty;
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;

    if (_loadingCampaign) {
      return Scaffold(
        backgroundColor: kBackground,
        body: const Center(child: CircularProgressIndicator(color: kPrimary)),
      );
    }

    if (_error == '_loadFail' && _campaign == null) {
      return Directionality(
        textDirection: context.dir,
        child: Scaffold(
          backgroundColor: kBackground,
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, color: kAccent, size: 48),
                  const SizedBox(height: 16),
                  Text(s.surveyError, style: const TextStyle(color: kAccent, fontSize: 16), textAlign: TextAlign.center),
                  const SizedBox(height: 24),
                  TextButton(
                    onPressed: _loadCampaign,
                    child: Text(s.retry, style: const TextStyle(color: kPrimary, fontSize: 16)),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    if (_alreadySubmitted) {
      return Directionality(
        textDirection: context.dir,
        child: Scaffold(
          backgroundColor: kBackground,
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: const BoxDecoration(
                        color: Color(0xFFD1FAE5),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check_circle_rounded, color: kSuccess, size: 52),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      s.alreadySubmitted,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: kPrimary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      s.alreadySubmittedSub,
                      style: TextStyle(fontSize: 15, color: Colors.grey.shade600, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 36),
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        onPressed: () => context.go('/home'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: kPrimary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: Text(s.backHome, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    final questions = _campaign!.surveyQuestions;
    final q = questions[_currentStep];
    final isLast = _currentStep == questions.length - 1;
    final progress = (_currentStep + 1) / questions.length;

    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        backgroundColor: kBackground,
        body: SafeArea(
          child: Column(
            children: [
              LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.grey.shade200,
                color: kAccent,
                minHeight: 4,
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 16),
                      Text(
                        s.surveyProgress(_currentStep + 1, questions.length),
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        s.isRtl ? q.textAr : (q.text.isNotEmpty ? q.text : q.textAr),
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: kPrimary, height: 1.4),
                      ),
                      if (!q.required)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(s.optional, style: TextStyle(color: Colors.grey.shade400, fontSize: 13)),
                        ),
                      const SizedBox(height: 40),
                      _buildInput(q, s),
                    ],
                  ),
                ),
              ),
              if (_error == '_submitFail')
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 8),
                  child: Text(s.submitError, style: const TextStyle(color: kAccent, fontSize: 13)),
                ),
              Padding(
                padding: const EdgeInsets.all(24),
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: (_canProceed() && !_submitting) ? _next : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kPrimary,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey.shade300,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: _submitting
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text(
                            isLast ? s.submitAnswers : s.nextQuestion,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInput(SurveyQuestion q, AppStr s) {
    switch (q.type) {
      case 'stars':
        return Center(
          child: StarRating(
            value: (_answers[q.id] as int?) ?? 0,
            onChanged: (v) => setState(() => _answers[q.id] = v),
          ),
        );
      case 'scale':
        return ScaleInput(
          value: (_answers[q.id] as int?) ?? 0,
          onChanged: (v) => setState(() => _answers[q.id] = v),
          labelMin: s.scaleUnlikely,
          labelMax: s.scaleLikely,
        );
      case 'multiple_choice':
        final opts = s.isRtl
            ? (q.optionsAr.isNotEmpty ? q.optionsAr : q.options)
            : q.options;
        final vals = q.options;
        return ChoiceChipGroup(
          options: opts,
          selected: _answers[q.id] != null
              ? opts[vals.indexOf(_answers[q.id] as String)]
              : null,
          onSelected: (label) {
            final idx = opts.indexOf(label);
            setState(() => _answers[q.id] = vals[idx]);
          },
        );
      case 'text':
        return TextField(
          onChanged: (v) => setState(() => _answers[q.id] = v),
          maxLines: 4,
          decoration: InputDecoration(
            hintText: s.writeOpinion,
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.all(16),
          ),
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
