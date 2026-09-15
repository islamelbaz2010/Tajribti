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

// Mobile Recovery + Current-Backend Alignment (2026-09-15): rewritten
// against the current survey contract. Two changes of substance:
//   - Questions now come from GET /consumer/campaigns/:id/survey (only
//     available once the participation is TRIAL_REDEEMED) — not from a
//     `surveyQuestions` field on the Campaign object, which the current
//     /consumer/campaigns/:id endpoint never returns (it embeds only
//     ELIGIBILITY-stage questions).
//   - The current Question.type enum is SINGLE_CHOICE | MULTI_CHOICE |
//     TEXT | RATING_1_5 | PURCHASE_INTENT_1_5 (api/src/lib/
//     studyTemplates.ts), not the old app's stars/scale/multiple_choice/
//     text strings. RATING_1_5 keeps the star widget (product-experience
//     rating), PURCHASE_INTENT_1_5 keeps the labeled scale widget
//     (already built with "unlikely/likely" wording for exactly this),
//     SINGLE_CHOICE/MULTI_CHOICE use the chip group, TEXT is unchanged.
//   - Submission is now the current backend's { questionId, valueText?,
//     valueNumber?, valueOptions? }[] shape (POST /consumer/campaigns/:id/
//     survey), not a redemptionId + free-form answers map.
class SurveyScreen extends StatefulWidget {
  final String campaignId;

  const SurveyScreen({super.key, required this.campaignId});

  @override
  State<SurveyScreen> createState() => _SurveyScreenState();
}

class _SurveyScreenState extends State<SurveyScreen> {
  List<SurveyQuestion>? _questions;
  bool _loading = true;
  bool _submitting = false;
  bool _alreadySubmitted = false;
  String? _error;

  int _currentStep = 0;
  // questionId -> int (RATING_1_5/PURCHASE_INTENT_1_5), String optionId
  // (SINGLE_CHOICE/MULTI_CHOICE), or String (TEXT).
  final Map<String, dynamic> _answers = {};

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  Future<void> _loadQuestions() async {
    setState(() { _loading = true; _error = null; });
    try {
      final questions = await apiClient.getSurveyQuestions(widget.campaignId);
      if (!mounted) return;
      setState(() { _questions = questions; _loading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = '_loadFail'; _loading = false; });
    }
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      final answers = (_questions ?? []).where((q) => _answers.containsKey(q.id)).map((q) {
        final raw = _answers[q.id];
        final entry = <String, dynamic>{'questionId': q.id};
        if (q.type == 'RATING_1_5' || q.type == 'PURCHASE_INTENT_1_5') {
          entry['valueNumber'] = raw as int;
        } else if (q.type == 'SINGLE_CHOICE' || q.type == 'MULTI_CHOICE') {
          entry['valueOptions'] = [raw as String];
        } else {
          entry['valueText'] = raw as String;
        }
        return entry;
      }).toList();

      await apiClient.submitSurvey(campaignId: widget.campaignId, answers: answers);
      if (!mounted) return;
      context.go('/thankyou');
    } catch (e) {
      if (e is DioException && e.response?.statusCode == 409) {
        if (!mounted) return;
        setState(() { _submitting = false; _alreadySubmitted = true; });
        return;
      }
      if (!mounted) return;
      setState(() { _submitting = false; _error = '_submitFail'; });
    }
  }

  void _next() {
    final questions = _questions ?? [];
    if (_currentStep < questions.length - 1) {
      setState(() => _currentStep++);
    } else {
      _submit();
    }
  }

  bool _canProceed() {
    final questions = _questions ?? [];
    if (questions.isEmpty) return false;
    final q = questions[_currentStep];
    if (!q.required) return true;
    return _answers[q.id] != null && _answers[q.id].toString().isNotEmpty;
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;

    if (_loading) {
      return Scaffold(
        backgroundColor: kBackground,
        body: const Center(child: CircularProgressIndicator(color: kPrimary)),
      );
    }

    if (_error == '_loadFail' && (_questions == null || _questions!.isEmpty)) {
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
                    onPressed: _loadQuestions,
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
                          backgroundColor: kBrand,
                          foregroundColor: kPrimary,
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

    final questions = _questions ?? [];
    if (questions.isEmpty) {
      // No POST_TRIAL questions configured for this campaign — nothing to
      // answer; treat as a clean completion rather than a stuck screen.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) context.go('/thankyou');
      });
      return Scaffold(
        backgroundColor: kBackground,
        body: const Center(child: CircularProgressIndicator(color: kPrimary)),
      );
    }

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
                        q.text,
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
                      backgroundColor: kBrand,
                      foregroundColor: kPrimary,
                      disabledBackgroundColor: Colors.grey.shade300,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: _submitting
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2))
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
      case 'RATING_1_5':
        return Center(
          child: StarRating(
            value: (_answers[q.id] as int?) ?? 0,
            onChanged: (v) => setState(() => _answers[q.id] = v),
          ),
        );
      case 'PURCHASE_INTENT_1_5':
        return ScaleInput(
          value: (_answers[q.id] as int?) ?? 0,
          onChanged: (v) => setState(() => _answers[q.id] = v),
          labelMin: s.scaleUnlikely,
          labelMax: s.scaleLikely,
        );
      case 'SINGLE_CHOICE':
      case 'MULTI_CHOICE':
        final selectedId = _answers[q.id] as String?;
        final selectedLabel = selectedId != null && q.optionIds.contains(selectedId)
            ? q.options[q.optionIds.indexOf(selectedId)]
            : null;
        return ChoiceChipGroup(
          options: q.options,
          selected: selectedLabel,
          onSelected: (label) {
            final idx = q.options.indexOf(label);
            setState(() => _answers[q.id] = q.optionIds[idx]);
          },
        );
      case 'TEXT':
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
