// Mobile Eligibility gap closure (2026-09-20): widget tests for the
// eligibility collection step. These prove the mobile UI produces the
// exact payload contract the backend evaluates — demographics
// (int age / ANY|MALE|FEMALE gender / free-text city) plus ELIGIBILITY
// answers keyed by questionId with valueOptions/valueText — the same
// shape the web Consumer submits. Server-side decisions (required
// screener unanswered -> INELIGIBLE, audience gates, duplicate 409) are
// covered by api/test/integrity.test.ts.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:consumer/core/l10n.dart';
import 'package:consumer/core/models.dart';
import 'package:consumer/widgets/eligibility_form.dart';

SurveyQuestion q({
  required String id,
  String type = 'SINGLE_CHOICE',
  bool required = true,
  List<String> options = const [],
  List<String> optionIds = const [],
}) =>
    SurveyQuestion(
      id: id,
      text: 'Question $id',
      textAr: 'Question $id',
      type: type,
      options: options,
      optionIds: optionIds,
      optionsAr: options,
      required: required,
    );

void main() {
  setUp(() {
    // English assertions; LangNotifier defaults to Arabic otherwise.
    langNotifier.value = false;
  });

  Future<_Harness> pumpForm(
    WidgetTester tester, {
    List<SurveyQuestion> questions = const [],
  }) async {
    final harness = _Harness();
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: EligibilityForm(questions: questions, onSubmit: harness.capture),
        ),
      ),
    ));
    await tester.pumpAndSettle();
    return harness;
  }

  Future<void> tap(WidgetTester tester, Key key) async {
    // Fields/chips below the fold need scrolling into view first.
    await tester.ensureVisible(find.byKey(key));
    await tester.tap(find.byKey(key));
    await tester.pump();
  }

  testWidgets('E4: age, gender and city fields are collected into the contract payload',
      (tester) async {
    final h = await pumpForm(tester);

    await tester.enterText(find.byKey(const Key('elig-age')), '25');
    await tap(tester, const Key('elig-gender-FEMALE'));
    await tester.ensureVisible(find.byKey(const Key('elig-city')));
    await tester.enterText(find.byKey(const Key('elig-city')), 'Cairo');
    await tap(tester, const Key('elig-submit'));

    expect(h.last, isNotNull);
    expect(h.last!.age, 25);
    expect(h.last!.gender, 'FEMALE'); // backend audienceGender vocabulary
    expect(h.last!.city, 'Cairo');
    expect(h.last!.answers, isEmpty);
  });

  testWidgets('E1: a campaign with no eligibility questions submits demographics only',
      (tester) async {
    final h = await pumpForm(tester);
    await tap(tester, const Key('elig-submit'));
    expect(h.last, isNotNull);
    expect(h.last!.answers, isEmpty);
    expect(h.last!.gender, 'ANY'); // prefer-not-to-say default, matching web
  });

  testWidgets('E2/E3: a required SINGLE_CHOICE screener renders and submits its option id',
      (tester) async {
    final h = await pumpForm(tester, questions: [
      q(id: 'q1', options: const ['Yes', 'No'], optionIds: const ['yes', 'no']),
    ]);
    expect(find.text('Question q1 *'), findsOneWidget);
    expect(find.text('Yes'), findsOneWidget);

    await tap(tester, const Key('elig-q-q1-yes'));
    await tap(tester, const Key('elig-submit'));

    expect(h.last, isNotNull);
    expect(h.last!.answers, hasLength(1));
    expect(h.last!.answers.single['questionId'], 'q1');
    expect(h.last!.answers.single['valueOptions'], ['yes']);
  });

  testWidgets('E7: an unanswered required screener cannot be submitted', (tester) async {
    final h = await pumpForm(tester, questions: [
      q(id: 'q1', options: const ['Yes', 'No'], optionIds: const ['yes', 'no']),
    ]);
    await tap(tester, const Key('elig-submit'));
    expect(h.last, isNull);
    expect(find.byKey(const Key('elig-error')), findsOneWidget);
  });

  testWidgets('MULTI_CHOICE screener submits every selected option id', (tester) async {
    final h = await pumpForm(tester, questions: [
      q(id: 'q2', type: 'MULTI_CHOICE', options: const ['A', 'B', 'C'], optionIds: const ['a', 'b', 'c']),
    ]);
    await tap(tester, const Key('elig-q-q2-a'));
    await tap(tester, const Key('elig-q-q2-c'));
    await tap(tester, const Key('elig-submit'));

    expect(h.last!.answers.single['valueOptions'], containsAll(<String>['a', 'c']));
    expect((h.last!.answers.single['valueOptions'] as List), hasLength(2));
  });

  testWidgets('TEXT screener submits valueText; optional question may be left blank',
      (tester) async {
    final h = await pumpForm(tester, questions: [
      q(id: 'q3', type: 'TEXT'),
      q(id: 'q4', type: 'TEXT', required: false),
    ]);
    await tester.ensureVisible(find.byKey(const Key('elig-q-q3')));
    await tester.enterText(find.byKey(const Key('elig-q-q3')), 'weekly');
    await tap(tester, const Key('elig-submit'));

    expect(h.last, isNotNull);
    expect(h.last!.answers, hasLength(1));
    expect(h.last!.answers.single['questionId'], 'q3');
    expect(h.last!.answers.single['valueText'], 'weekly');
  });
}

class _Harness {
  EligibilityFormData? last;
  void capture(EligibilityFormData d) => last = d;
}
