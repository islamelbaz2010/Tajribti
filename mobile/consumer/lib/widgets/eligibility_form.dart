import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/models.dart';

// Mobile Eligibility gap closure (2026-09-20): collects the exact payload
// the existing eligibility contract expects —
//   POST /consumer/campaigns/:id/eligibility
//     { qrSourceId?, age?: int, gender?: 'ANY'|'MALE'|'FEMALE', city?,
//       answers: [{ questionId, valueOptions?|valueText? }] }
// — the same shape the released web Consumer submits
// (web/app/consumer/index.html). Gender values intentionally use the
// backend's ANY/MALE/FEMALE vocabulary, NOT the profile screen's legacy
// lowercase 'male'/'female' values, because the server compares gender
// verbatim against campaign.audienceGender. Age is a raw integer (the
// server compares it against audienceAgeMin/Max), not the profile screen's
// age-range buckets.
//
// Answer encoding mirrors the web contract: SINGLE_CHOICE submits one
// option id, MULTI_CHOICE submits all selected ids (required for the
// eligibility contract to be representable at all — not a survey
// redesign), and every other question type submits a free-text valueText.
class EligibilityFormData {
  final int? age;
  final String? gender;
  final String? city;
  final List<Map<String, dynamic>> answers;

  const EligibilityFormData({this.age, this.gender, this.city, this.answers = const []});
}

class EligibilityForm extends StatefulWidget {
  final List<SurveyQuestion> questions;
  final bool submitting;
  final void Function(EligibilityFormData data) onSubmit;

  const EligibilityForm({
    super.key,
    required this.questions,
    required this.onSubmit,
    this.submitting = false,
  });

  @override
  State<EligibilityForm> createState() => _EligibilityFormState();
}

class _EligibilityFormState extends State<EligibilityForm> {
  final _ageCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  String _gender = 'ANY';
  String? _error;

  // questionId -> selected option ids (choice questions) or text controller
  // (all other types — the eligibility answer schema carries valueText).
  final Map<String, Set<String>> _choices = {};
  final Map<String, TextEditingController> _textCtrls = {};

  @override
  void initState() {
    super.initState();
    for (final q in widget.questions) {
      if (q.type == 'SINGLE_CHOICE' || q.type == 'MULTI_CHOICE') {
        _choices[q.id] = {};
      } else {
        _textCtrls[q.id] = TextEditingController();
      }
    }
  }

  @override
  void dispose() {
    _ageCtrl.dispose();
    _cityCtrl.dispose();
    for (final c in _textCtrls.values) c.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> _buildAnswers() {
    final answers = <Map<String, dynamic>>[];
    for (final q in widget.questions) {
      if (q.type == 'SINGLE_CHOICE' || q.type == 'MULTI_CHOICE') {
        final selected = _choices[q.id] ?? {};
        if (selected.isNotEmpty) {
          answers.add({'questionId': q.id, 'valueOptions': selected.toList()});
        }
      } else {
        final v = _textCtrls[q.id]?.text.trim() ?? '';
        if (v.isNotEmpty) answers.add({'questionId': q.id, 'valueText': v});
      }
    }
    return answers;
  }

  void _submit() {
    final s = context.l10n;
    final answers = _buildAnswers();
    final answeredIds = answers.map((a) => a['questionId'] as String).toSet();
    final missingRequired = widget.questions.any((q) => q.required && !answeredIds.contains(q.id));
    if (missingRequired) {
      setState(() => _error = s.requiredQuestions);
      return;
    }
    final city = _cityCtrl.text.trim();
    widget.onSubmit(EligibilityFormData(
      age: int.tryParse(_ageCtrl.text.trim()),
      gender: _gender,
      city: city.isEmpty ? null : city,
      answers: answers,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Demographics (audience contract: age / gender / city) ──────
        _FieldLabel(s.ageInputLabel),
        const SizedBox(height: 8),
        TextField(
          key: const Key('elig-age'),
          controller: _ageCtrl,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: _inputDeco(s.ageInputHint),
        ),
        const SizedBox(height: 16),
        _FieldLabel(s.genderLabel),
        const SizedBox(height: 8),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            _Chip(
              key: const Key('elig-gender-ANY'),
              label: s.preferNotToSay,
              selected: _gender == 'ANY',
              onTap: () => setState(() => _gender = 'ANY'),
            ),
            _Chip(
              key: const Key('elig-gender-MALE'),
              label: s.genders[0],
              selected: _gender == 'MALE',
              onTap: () => setState(() => _gender = 'MALE'),
            ),
            _Chip(
              key: const Key('elig-gender-FEMALE'),
              label: s.genders[1],
              selected: _gender == 'FEMALE',
              onTap: () => setState(() => _gender = 'FEMALE'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _FieldLabel(s.cityLabel),
        const SizedBox(height: 8),
        TextField(
          key: const Key('elig-city'),
          controller: _cityCtrl,
          decoration: _inputDeco(s.cityHint),
        ),

        // ── Campaign screener questions (ELIGIBILITY stage) ────────────
        for (final q in widget.questions) ...[
          const SizedBox(height: 20),
          _FieldLabel(q.text + (q.required ? ' *' : '')),
          const SizedBox(height: 8),
          if (q.type == 'SINGLE_CHOICE' || q.type == 'MULTI_CHOICE')
            q.optionIds.isEmpty
                ? Text(s.noAnswerOptions, style: TextStyle(fontSize: 13, color: Colors.grey.shade500))
                : Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      for (var i = 0; i < q.optionIds.length; i++)
                        _Chip(
                          key: Key('elig-q-${q.id}-${q.optionIds[i]}'),
                          label: i < q.options.length ? q.options[i] : q.optionIds[i],
                          selected: (_choices[q.id] ?? {}).contains(q.optionIds[i]),
                          onTap: () => setState(() {
                            final set = _choices[q.id] ??= {};
                            if (q.type == 'SINGLE_CHOICE') {
                              set
                                ..clear()
                                ..add(q.optionIds[i]);
                            } else {
                              if (set.contains(q.optionIds[i])) {
                                set.remove(q.optionIds[i]);
                              } else {
                                set.add(q.optionIds[i]);
                              }
                            }
                          }),
                        ),
                    ],
                  )
          else
            TextField(
              key: Key('elig-q-${q.id}'),
              controller: _textCtrls[q.id],
              decoration: _inputDeco(s.writeOpinion),
            ),
        ],

        if (_error != null) ...[
          const SizedBox(height: 16),
          Text(_error!, key: const Key('elig-error'), style: const TextStyle(color: kAccent, fontSize: 13)),
        ],

        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            key: const Key('elig-submit'),
            onPressed: widget.submitting ? null : _submit,
            style: ElevatedButton.styleFrom(
              backgroundColor: kBrand,
              foregroundColor: kPrimary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: widget.submitting
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2))
                : Text(s.checkEligibility, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
          ),
        ),
      ],
    );
  }

  InputDecoration _inputDeco(String hint) => InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: kPrimary, width: 2),
        ),
      );
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: kPrimary));
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _Chip({super.key, required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: selected ? kPrimary : Colors.white,
          borderRadius: BorderRadius.circular(50),
          border: Border.all(color: selected ? kPrimary : Colors.grey.shade300, width: 1.5),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 15,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            color: selected ? Colors.white : Colors.grey.shade700,
          ),
        ),
      ),
    );
  }
}
