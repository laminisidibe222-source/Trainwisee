import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Two languages, one dictionary per language, flat keys.
 *
 * `en` is the source of truth: `Dict` is derived from it, so TypeScript refuses
 * a French entry that is missing or misspelled. That is the whole safety net —
 * no runtime fallback hunting, no half-translated screens.
 */
export const en = {
  'nav.features': 'Features',
  'nav.how': 'How it Works',
  'nav.preview': 'Blueprint Preview',
  'nav.pricing': 'Pricing',
  'nav.faq': 'FAQ',
  'nav.login': 'Log in',
  'nav.signup': 'Sign up',
  'nav.logout': 'Log out',
  'nav.get': 'Get My Blueprint',
  'nav.dashboard': 'Dashboard',
  'nav.myPlans': 'My plans',
  'nav.new': 'New blueprint',
  'nav.newShort': 'New',

  'landing.hero.t1': 'Your body.',
  'landing.hero.t2': 'Decoded.',
  'landing.hero.sub':
    'Stop guessing with generic routines. TrainWise turns your body data into a training and nutrition blueprint built around your life — in under a minute.',
  'landing.hero.cta': 'Generate Your Blueprint',
  'landing.hero.sample': 'See a sample blueprint',
  'landing.hero.check1': 'No credit card required',
  'landing.hero.check2': 'One-minute onboarding',
  'landing.hero.check3': 'PDF + web blueprint',
  'landing.float1.label': 'Weekly volume',
  'landing.float1.value': '+18.4% planned',
  'landing.float2.label': 'Daily calorie target',
  'landing.float2.value': '2,650 kcal (lean bulk)',
  'landing.trust': 'Built for lifters, runners and coaches who log their training',
  'landing.features.title': 'Precision, not guesswork',
  'landing.features.sub':
    'Every number comes from a formula you could check by hand: Mifflin-St Jeor for metabolism, evidence-based protein ranges, and progression rules that respect your recovery.',
  'landing.features.f1.title': 'Training built around your gym',
  'landing.features.f1.desc':
    'Splits chosen from the equipment you actually have, your experience level and the days you can train.',
  'landing.features.f2.title': 'Macros that add up',
  'landing.features.f2.desc':
    'Calories from your measured TDEE, protein scaled to bodyweight, then carbs and fat split for your goal.',
  'landing.features.f3.title': 'Recovery planned in',
  'landing.features.f3.desc':
    'Sleep targets, deload timing and a readiness check so progress does not turn into an injury.',
  'landing.features.f4.title': 'Yours to keep',
  'landing.features.f4.desc':
    'Every blueprint is saved to your account — print it, open it on your phone at the gym, or regenerate later.',
  'landing.features.f5.title': '12-week roadmap',
  'landing.features.f5.desc':
    'Four blocks, each with a focus and a milestone, so you know what “on track” looks like in week 9.',
  'landing.features.f6.title': 'Honest about the maths',
  'landing.features.f6.desc':
    'If a target falls below a safe intake, the plan says so instead of silently starving you.',

  'landing.how.title': 'Three steps to your blueprint',
  'landing.how.sub': 'No sales call, no questionnaire that goes nowhere.',
  'landing.how.s1.title': 'Tell us about you',
  'landing.how.s1.desc': 'Age, height, weight, goal, equipment, diet and how you sleep. Four short screens.',
  'landing.how.s2.title': 'We do the maths',
  'landing.how.s2.desc':
    'Your profile is validated and run through the plan engine on our server, then stored in your account.',
  'landing.how.s3.title': 'Train from the plan',
  'landing.how.s3.desc': 'Open your split, macros and roadmap at the gym — or come back for a new one any time.',

  'landing.preview.title': 'Inside your generated blueprint',
  'landing.preview.sub': 'Every plan has the same four sections, filled with your numbers.',
  'landing.preview.badge': 'Sample generated document',
  'landing.preview.doc': 'Alex Morgan — hypertrophy & recomp',
  'landing.preview.cta': 'Generate mine',
  'landing.preview.split': 'Training split',
  'landing.preview.splitValue': 'Upper / lower, 4 days',
  'landing.preview.splitSub': 'Progressive overload, RPE 7–9',
  'landing.preview.kcal': 'Daily calories',
  'landing.preview.kcalSub': 'P 195 g · C 310 g · F 85 g',
  'landing.preview.recovery': 'Recovery',
  'landing.preview.recoveryValue': '8 h sleep + mobility',
  'landing.preview.recoverySub': 'Lower-back friendly session',

  'landing.pricing.title': 'Pick how far you want to go',
  'landing.pricing.sub': 'Start with one blueprint. Upgrade when the plan needs to change with you.',
  'landing.pricing.popular': 'Most popular',
  'landing.pricing.period': '/ once',
  'landing.pricing.p1.name': 'Starter',
  'landing.pricing.p1.desc': 'One complete blueprint with your split, macros and 12-week roadmap.',
  'landing.pricing.p2.name': 'Pro',
  'landing.pricing.p2.desc': 'Unlimited blueprints, regenerated whenever your weight or schedule shifts.',
  'landing.pricing.p3.name': 'Coached',
  'landing.pricing.p3.desc': 'Everything in Pro plus a monthly review with a human coach.',
  'landing.pricing.cta': 'Get started',

  'landing.cta.title': 'Ready to stop guessing?',
  'landing.cta.sub': 'Build your first blueprint in about a minute — and keep it in your account.',
  'landing.cta.btn': 'Generate Your Blueprint',
  'landing.footer.rights': 'All rights reserved.',
  'landing.footer.privacy': 'Privacy Policy',
  'landing.footer.terms': 'Terms',
  'landing.footer.contact': 'Contact',

  'auth.back': 'Back to site',
  'auth.login.title': 'Welcome back',
  'auth.login.sub': 'Sign in to build a new blueprint or open a saved one.',
  'auth.signup.title': 'Create your account',
  'auth.signup.sub': 'One account keeps every blueprint you generate.',
  'auth.tab.login': 'Log in',
  'auth.tab.signup': 'Sign up',
  'auth.name': 'Name (optional)',
  'auth.namePlaceholder': 'Alex',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.passwordHint': 'At least 8 characters',
  'auth.show': 'Show password',
  'auth.hide': 'Hide password',
  'auth.submit.login': 'Log in',
  'auth.submit.signup': 'Create account',
  'auth.busy.login': 'Signing in…',
  'auth.busy.signup': 'Creating account…',
  'auth.haveAccount': 'Already have an account?',
  'auth.newHere': 'New to TrainWise?',
  'auth.createFree': 'Create one free',
  'auth.note1': 'Passwords are hashed with scrypt, sessions are httpOnly cookies.',
  'auth.note2': 'We never store a plan against a visitor who is not signed in.',
  'auth.strength.1': 'weak',
  'auth.strength.2': 'ok',
  'auth.strength.3': 'good',
  'auth.strength.4': 'strong',
  'auth.err.email': 'Enter a valid email address.',
  'auth.err.short': 'Use at least 8 characters.',
  'auth.err.mix': 'Include at least one letter and one number.',
  'auth.err.generic': 'Something went wrong. Try again.',
  'auth.signedIn': 'Signed in as {name}',

  'wizard.title': 'Body blueprint setup',
  'wizard.step': 'Step {n} of 4',
  'wizard.stepShort': '{n}/4',
  'wizard.cancel': 'Cancel',
  'wizard.back': 'Back',
  'wizard.continue': 'Continue',
  'wizard.generate': 'Generate my blueprint',
  'wizard.s1.title': 'Physical biometrics',
  'wizard.age': 'Age',
  'wizard.sex': 'Sex',
  'wizard.sex.male': 'Male',
  'wizard.sex.female': 'Female',
  'wizard.sex.other': 'Other',
  'wizard.height': 'Height (cm)',
  'wizard.weight': 'Weight (kg)',
  'wizard.s2.title': 'Goal & experience',
  'wizard.goal.q': 'What is your main objective?',
  'wizard.goal.build_muscle': 'Build muscle',
  'wizard.goal.build_muscle.desc': 'Add clean muscle mass and strength',
  'wizard.goal.lose_fat': 'Lose fat',
  'wizard.goal.lose_fat.desc': 'Drop body fat while keeping muscle',
  'wizard.goal.recomp': 'Recomposition',
  'wizard.goal.recomp.desc': 'Build muscle and lose fat at the same time',
  'wizard.goal.athletic_performance': 'Performance',
  'wizard.goal.athletic_performance.desc': 'Power, speed and stamina',
  'wizard.s3.title': 'Equipment & joints',
  'wizard.injuries.q': 'Any joints we should protect?',
  'wizard.injuries.optional': 'Optional — we swap the exercise, not the goal.',
  'wizard.inj.knee': 'Knees',
  'wizard.inj.lower_back': 'Lower back',
  'wizard.inj.shoulder': 'Shoulders',
  'wizard.inj.wrist_elbow': 'Wrists / elbows',
  'wizard.inj.hip': 'Hips',
  'wizard.inj.neck': 'Neck',
  'injury.reason.knee': 'Knee-friendly range and loading',
  'injury.reason.lower_back': 'Spine-sparing alternative',
  'injury.reason.shoulder': 'Shoulder-friendly path',
  'injury.reason.wrist_elbow': 'Neutral wrist position',
  'injury.reason.hip': 'Hip-friendly pattern',
  'injury.reason.neck': 'Less neck loading',
  'result.adapted': 'Adapted for you',
  'result.adaptedSub': 'Exercises changed because of the joints you flagged.',
  'dash.adaptedOne': '1 exercise adapted',
  'dash.adaptedMany': '{n} exercises adapted',
  'dash.adaptedTitle': 'Adapted for your joints',
  'wizard.equipment.q': 'What can you train with?',
  'wizard.eq.barbell': 'barbell',
  'wizard.eq.dumbbell': 'dumbbells',
  'wizard.eq.rack': 'rack',
  'wizard.eq.cables': 'cables',
  'wizard.eq.machines': 'machines',
  'wizard.eq.bodyweight': 'bodyweight',
  'wizard.s4.title': 'Nutrition & recovery',
  'wizard.diet': 'Dietary preference',
  'wizard.diet.standard': 'Standard / omnivore',
  'wizard.diet.vegetarian': 'Vegetarian',
  'wizard.diet.vegan': 'Vegan',
  'wizard.diet.keto': 'Ketogenic',
  'wizard.diet.paleo': 'Paleo',
  'wizard.sleep': 'Average sleep (hours per night)',

  'result.saved': 'Saved to Neon',
  'result.savedShort': 'saved to Neon',
  'result.title1': 'Your Body',
  'result.title2': 'Blueprint',
  'result.meta': '{split} · {n} sessions per week · {version}',
  'result.myPlans': 'My plans',
  'result.startOver': 'Start over',
  'result.nutrition': 'Nutrition',
  'result.intake': 'Daily intake',
  'result.intakeSub': 'kcal target',
  'result.protein': 'Protein',
  'result.proteinSub': '{pct}% of kcal',
  'result.carbs': 'Carbs',
  'result.carbsSub': 'training fuel',
  'result.fat': 'Fat',
  'result.fatSub': 'hormone floor',
  'result.math': 'BMR {bmr} kcal · TDEE {tdee} kcal · adjusted for your goal',
  'result.training': 'Training',
  'result.recovery': 'Recovery',
  'result.sleepDeload': 'Sleep {sleep} h · deload every {weeks} weeks',
  'result.roadmap': '12-week roadmap',

  'plans.eyebrow': 'Your account',
  'plans.title1': 'Hi {name},',
  'plans.title2': 'your plans',
  'plans.sub': 'Every blueprint you generate is stored in your account. Open one for the split, macros and roadmap.',
  'plans.empty.title': 'No blueprint yet',
  'plans.empty.sub': 'Four short steps and it lands here, saved to your account.',
  'plans.empty.cta': 'Build my blueprint',
  'plans.card.title': 'Blueprint #{id}',
  'plans.card.new': 'New blueprint',
  'plans.card.open': 'Open',
  'plans.card.saved': 'Saved',
  'plans.count': '{n} saved',
  'plans.footer': 'Everything is stored on your account: open a plan from any device with your login.',
  'plans.engine.title': 'How these programmes are built',
  'plans.engine.sub': 'No random output: every plan comes from the same rules engine, and the maths is printed inside each one.',
  'plans.engine.c1': 'Body maths',
  'plans.engine.c1b': 'Mifflin-St Jeor for your intake, then macros from your bodyweight and goal.',
  'plans.engine.c2': 'Split choice',
  'plans.engine.c2b': '2 to 6 sessions a week, chosen from your experience and equipment.',
  'plans.engine.c3': 'Joint swaps',
  'plans.engine.c3b': 'Marked joints replace the loaded lift with the same pattern, less range.',
  'result.back': 'Back',
  'plans.card.newSub': 'Four steps, saved to your account',
  'plans.opening': 'Opening your blueprint…',
  'plans.error': 'Could not load your plans.',
  'plans.retry': 'Try again',

  'dash.greeting1': 'Hi {name} —',
  'dash.greeting2': 'week {week} of 12',
  'dash.greetingEmpty1': 'Hi {name},',
  'dash.greetingEmpty2': 'let’s build your plan',
  'dash.sub': 'Your numbers, this week’s split and the current block — all in one place.',
  'dash.nextSession': 'Next session',
  'dash.subEmpty': 'Build a blueprint and this page becomes your training home.',
  'dash.openFull': 'Open full blueprint',
  'dash.weekLabel': 'Week {n}',
  'dash.of12': 'of 12 weeks',
  'dash.tile.kcalSub': 'BMR {bmr} · TDEE {tdee}',
  'dash.tile.proteinSub': '{pct}% of calories',
  'dash.tile.sessionsSub': '{split}',
  'dash.blockNow': 'Now',
  'dash.roadmapSub': 'Four blocks, one milestone each',
  'dash.goal': 'Goal',
  'dash.kcal': 'Daily calories',
  'dash.protein': 'Protein',
  'dash.sessions': 'Sessions',
  'dash.perWeek': '/ week',
  'dash.today': 'today',
  'dash.weekOf': 'Week {n} of 12',
  'dash.split': 'This week’s split',
  'dash.startHere': 'Start here',
  'dash.exercises': '{n} exercises',
  'dash.block': 'Current block',
  'dash.sleep': 'Sleep {n} h',
  'dash.deload': 'Deload every {n} weeks',
  'dash.openPlan': 'Open plan',
  'dash.roadmap': 'The 12 weeks',
  'dash.history': 'Plan history',
  'dash.viewAll': 'View all ({n})',
  'dash.active': 'Active',
  'dash.updated': 'Updated {date}',
  'dash.empty.title': 'Your dashboard is waiting for a blueprint',
  'dash.empty.sub':
    'Four short steps — goal, training, food, timing — and you get a full split, macro targets and a 12-week roadmap here.',
  'dash.empty.cta': 'Build my blueprint',
  'dash.empty.note': 'About a minute — no card required.',
  'dash.tile1.title': 'A split you can run',
  'dash.tile1.body': 'Built from your equipment, experience and days per week — not a template that assumes a full gym.',
  'dash.tile2.title': 'Numbers, not guesses',
  'dash.tile2.body': 'BMR from Mifflin-St Jeor, TDEE from your activity level, then calories and protein for your goal.',
  'dash.tile3.title': 'A 12-week roadmap',
  'dash.tile3.body': 'Four blocks with a milestone each, plus sleep, deload and cardio guidance.',

  'nav.account': 'Account menu',
  'nav.workspace': 'Workspace',
  'nav.newPlan': 'New blueprint',
  'nav.needPlan': 'Need a new plan?',
  'nav.needPlanBody': 'Four questions and a fresh split lands on this page.',
  'nav.currentPlan': 'Current plan',
  'nav.weekOf': 'Week {n}',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',

  'hero.hello': 'Hello, {name}!',
  'hero.body': '{n} sessions this week · next: {focus}.',

  'perf.title': 'Performance',
  'perf.sub': 'Working sets per session · {n} sessions',
  'share.title': 'Macro split',
  'share.sub': 'Where the calories come from',
  'share.kcal': 'kcal',
  'area.title': 'Week profile',
  'area.sub': 'Main lifts vs accessory work',
  'dash.kcalDay': 'Daily calories',
  'dash.sessionsCard': 'Sessions',
  'dash.setsWeek': 'Working sets',
  'dash.col.session': 'Session',
  'dash.col.focus': 'Focus',
  'dash.col.ex': 'Exercises',
  'dash.col.sets': 'Sets',
  'dash.col.time': 'Time',
  'dash.weekVs': 'vs last week',

  'perf.weekly': 'working sets this week',
  'perf.best': 'Best day',
  'perf.setsShort': 'sets',
  'perf.primary': 'Main lifts',
  'perf.accessory': 'Accessory',
  'perf.avg': 'avg {n}',
  'perf.all': 'All sessions',
  'perf.chartAlt': 'Working sets per session',

  'dial.title': 'Your numbers',
  'dial.sub': 'Macros, energy intake and recovery, straight from your blueprint',
  'dial.protein': 'Protein',
  'dial.carbs': 'Carbs',
  'dial.fat': 'Fat',
  'dial.intake': 'Intake / TDEE',
  'dial.sleep': 'Sleep',
  'dial.block': 'Block',

  'split.title': 'This week’s split',
  'split.see': 'Open plan',

  'week.title': 'This week',
  'week.sub': '{n} sessions in the plan',
  'week.duration': '{n} min',

  'blocks.title': 'Upcoming blocks',
  'blocks.seeAll': 'See all',
  'blocks.weeks': 'Weeks {range}',

  'search.placeholder': 'Search an exercise or a session',
  'search.empty': 'Build a blueprint to search it',
  'search.none': 'Nothing matches “{q}”',
  'search.clear': 'Clear search',

  'side.tipTitle': 'Cardio',

  'meals.title': 'Today’s meals',
  'meals.sub': '{n} meals in your blueprint',
  'history.row': '#{id} · {goal}',

  'goal.lose_fat': 'Fat loss',
  'goal.build_muscle': 'Build muscle',
  'goal.recomp': 'Recomposition',
  'goal.athletic_performance': 'Performance',
  'goal.none': 'Your plan',

  'err.apiDown': 'The API is not reachable. Check that the server is running.',
  'err.dbDown': 'The database is not reachable right now. Try again in a moment.',
  'err.signin': 'Please sign in to continue.',
  'err.credentials': 'Email or password is incorrect.',
  'err.taken': 'An account with that email already exists.',
  'err.session': 'Your session expired — sign in again.',
  'err.plan': 'Could not generate your blueprint.',
  'err.openPlan': 'Could not open that plan.',
  'err.loggedOut': 'Signed out.',
  'err.saved': 'Blueprint saved to your account.',
  'err.rate': 'Too many attempts. Try again in 15 minutes.',
  'err.required': 'Email and password are required.',
  'err.profile': 'Please check the values you entered.',
  'err.unexpected': 'Unexpected server error. Try again.',
  'err.notFound': 'That page or plan does not exist.',
  'app.generating': 'Computing your blueprint and saving it to Neon…',
} as const;

export type Dict = typeof en;
export type TKey = keyof Dict;

const fr: Record<TKey, string> = {
  'nav.features': 'Fonctionnalités',
  'nav.how': 'Comment ça marche',
  'nav.preview': 'Aperçu',
  'nav.pricing': 'Tarifs',
  'nav.faq': 'FAQ',
  'nav.login': 'Connexion',
  'nav.signup': "S'inscrire",
  'nav.logout': 'Déconnexion',
  'nav.get': 'Mon programme',
  'nav.dashboard': 'Tableau de bord',
  'nav.myPlans': 'Mes programmes',
  'nav.new': 'Nouveau programme',
  'nav.newShort': 'Nouveau',

  'landing.hero.t1': 'Votre corps.',
  'landing.hero.t2': 'Décodé.',
  'landing.hero.sub':
    'Arrêtez les routines génériques. TrainWise transforme vos données en un programme d’entraînement et de nutrition construit autour de votre vie — en moins d’une minute.',
  'landing.hero.cta': 'Créer mon programme',
  'landing.hero.sample': 'Voir un exemple',
  'landing.hero.check1': 'Sans carte bancaire',
  'landing.hero.check2': 'Une minute de questions',
  'landing.hero.check3': 'PDF + web',
  'landing.float1.label': 'Volume hebdo',
  'landing.float1.value': '+18,4 % planifié',
  'landing.float2.label': 'Objectif calorique',
  'landing.float2.value': '2 650 kcal (prise sèche)',
  'landing.trust': 'Conçu pour celles et ceux qui notent leurs séances',
  'landing.features.title': 'De la précision, pas des suppositions',
  'landing.features.sub':
    'Chaque chiffre vient d’une formule vérifiable : Mifflin-St Jeor pour le métabolisme, des apports en protéines documentés, et une progression qui respecte votre récupération.',
  'landing.features.f1.title': 'Un entraînement adapté à votre salle',
  'landing.features.f1.desc':
    'Les splits sont choisis selon votre matériel, votre niveau et le nombre de jours dont vous disposez.',
  'landing.features.f2.title': 'Des macros qui tiennent debout',
  'landing.features.f2.desc':
    'Calories issues de votre TDEE, protéines calculées au poids de corps, puis glucides et lipides répartis selon l’objectif.',
  'landing.features.f3.title': 'La récupération prévue',
  'landing.features.f3.desc':
    'Objectif de sommeil, moment du deload et point de contrôle pour que la progression ne devienne pas une blessure.',
  'landing.features.f4.title': 'Un programme qui reste à vous',
  'landing.features.f4.desc':
    'Chaque programme est enregistré sur votre compte : imprimez-le, ouvrez-le à la salle, régénérez-le plus tard.',
  'landing.features.f5.title': 'Feuille de route sur 12 semaines',
  'landing.features.f5.desc':
    'Quatre blocs, chacun avec un focus et un jalon, pour savoir à quoi ressemble « être dans les temps » en semaine 9.',
  'landing.features.f6.title': 'Honnête sur les chiffres',
  'landing.features.f6.desc':
    'Si une cible passe sous un apport sûr, le programme le dit au lieu de vous affamer en silence.',

  'landing.how.title': 'Trois étapes vers votre programme',
  'landing.how.sub': 'Pas d’appel commercial, pas de questionnaire sans suite.',
  'landing.how.s1.title': 'Parlez-nous de vous',
  'landing.how.s1.desc': 'Âge, taille, poids, objectif, matériel, alimentation et sommeil. Quatre écrans.',
  'landing.how.s2.title': 'On fait les calculs',
  'landing.how.s2.desc':
    'Votre profil est validé puis traité par le moteur du programme sur notre serveur, et enregistré sur votre compte.',
  'landing.how.s3.title': 'Entraînez-vous',
  'landing.how.s3.desc':
    'Ouvrez votre split, vos macros et votre feuille de route à la salle — ou revenez en générer un autre.',

  'landing.preview.title': 'À l’intérieur de votre programme',
  'landing.preview.sub': 'Chaque programme contient les mêmes quatre sections, remplies avec vos chiffres.',
  'landing.preview.badge': 'Exemple de document',
  'landing.preview.doc': 'Alex Morgan — hypertrophie & recomposition',
  'landing.preview.cta': 'Générer le mien',
  'landing.preview.split': 'Split d’entraînement',
  'landing.preview.splitValue': 'Haut / bas, 4 jours',
  'landing.preview.splitSub': 'Surcharge progressive, RPE 7–9',
  'landing.preview.kcal': 'Calories par jour',
  'landing.preview.kcalSub': 'P 195 g · G 310 g · L 85 g',
  'landing.preview.recovery': 'Récupération',
  'landing.preview.recoveryValue': '8 h de sommeil + mobilité',
  'landing.preview.recoverySub': 'Séance respectueuse du bas du dos',

  'landing.pricing.title': 'Choisissez jusqu’où aller',
  'landing.pricing.sub': 'Commencez par un programme. Évoluez quand le plan doit évoluer avec vous.',
  'landing.pricing.popular': 'Le plus choisi',
  'landing.pricing.period': '/ une fois',
  'landing.pricing.p1.name': 'Essentiel',
  'landing.pricing.p1.desc': 'Un programme complet avec split, macros et feuille de route sur 12 semaines.',
  'landing.pricing.p2.name': 'Pro',
  'landing.pricing.p2.desc': 'Programmes illimités, régénérés dès que votre poids ou votre emploi du temps change.',
  'landing.pricing.p3.name': 'Coaching',
  'landing.pricing.p3.desc': 'Tout Pro, plus un bilan mensuel avec un coach humain.',
  'landing.pricing.cta': 'Commencer',

  'landing.cta.title': 'Prêt à arrêter de deviner ?',
  'landing.cta.sub': 'Créez votre premier programme en une minute — et gardez-le sur votre compte.',
  'landing.cta.btn': 'Créer mon programme',
  'landing.footer.rights': 'Tous droits réservés.',
  'landing.footer.privacy': 'Confidentialité',
  'landing.footer.terms': 'Conditions',
  'landing.footer.contact': 'Contact',

  'auth.back': 'Retour au site',
  'auth.login.title': 'Content de vous revoir',
  'auth.login.sub': 'Connectez-vous pour créer un programme ou en ouvrir un existant.',
  'auth.signup.title': 'Créer votre compte',
  'auth.signup.sub': 'Un compte conserve tous les programmes que vous générez.',
  'auth.tab.login': 'Connexion',
  'auth.tab.signup': 'Inscription',
  'auth.name': 'Nom (facultatif)',
  'auth.namePlaceholder': 'Alex',
  'auth.email': 'E-mail',
  'auth.password': 'Mot de passe',
  'auth.passwordHint': 'Au moins 8 caractères',
  'auth.show': 'Afficher le mot de passe',
  'auth.hide': 'Masquer le mot de passe',
  'auth.submit.login': 'Se connecter',
  'auth.submit.signup': 'Créer le compte',
  'auth.busy.login': 'Connexion…',
  'auth.busy.signup': 'Création du compte…',
  'auth.haveAccount': 'Vous avez déjà un compte ?',
  'auth.newHere': 'Nouveau sur TrainWise ?',
  'auth.createFree': 'Créez-en un gratuitement',
  'auth.note1': 'Les mots de passe sont hachés avec scrypt, les sessions sont des cookies httpOnly.',
  'auth.note2': 'Aucun programme n’est enregistré pour un visiteur non connecté.',
  'auth.strength.1': 'faible',
  'auth.strength.2': 'moyen',
  'auth.strength.3': 'bon',
  'auth.strength.4': 'fort',
  'auth.err.email': 'Saisissez une adresse e-mail valide.',
  'auth.err.short': 'Utilisez au moins 8 caractères.',
  'auth.err.mix': 'Ajoutez au moins une lettre et un chiffre.',
  'auth.err.generic': 'Une erreur est survenue. Réessayez.',
  'auth.signedIn': 'Connecté en tant que {name}',

  'wizard.title': 'Création du programme',
  'wizard.step': 'Étape {n} sur 4',
  'wizard.stepShort': '{n}/4',
  'wizard.cancel': 'Annuler',
  'wizard.back': 'Retour',
  'wizard.continue': 'Continuer',
  'wizard.generate': 'Générer mon programme',
  'wizard.s1.title': 'Données physiques',
  'wizard.age': 'Âge',
  'wizard.sex': 'Sexe',
  'wizard.sex.male': 'Homme',
  'wizard.sex.female': 'Femme',
  'wizard.sex.other': 'Autre',
  'wizard.height': 'Taille (cm)',
  'wizard.weight': 'Poids (kg)',
  'wizard.s2.title': 'Objectif & expérience',
  'wizard.goal.q': 'Quel est votre objectif principal ?',
  'wizard.goal.build_muscle': 'Prendre du muscle',
  'wizard.goal.build_muscle.desc': 'Gagner du muscle propre et de la force',
  'wizard.goal.lose_fat': 'Perdre du gras',
  'wizard.goal.lose_fat.desc': 'Baisser la masse grasse en gardant le muscle',
  'wizard.goal.recomp': 'Recomposition',
  'wizard.goal.recomp.desc': 'Prendre du muscle et perdre du gras en même temps',
  'wizard.goal.athletic_performance': 'Performance',
  'wizard.goal.athletic_performance.desc': 'Puissance, vitesse et endurance',
  'wizard.s3.title': 'Matériel & articulations',
  'wizard.injuries.q': 'Des articulations à ménager ?',
  'wizard.injuries.optional': 'Facultatif — on change l’exercice, pas l’objectif.',
  'wizard.inj.knee': 'Genoux',
  'wizard.inj.lower_back': 'Bas du dos',
  'wizard.inj.shoulder': 'Épaules',
  'wizard.inj.wrist_elbow': 'Poignets / coudes',
  'wizard.inj.hip': 'Hanches',
  'wizard.inj.neck': 'Nuque',
  'injury.reason.knee': 'Amplitude et charge adaptées au genou',
  'injury.reason.lower_back': 'Variante qui épargne la colonne',
  'injury.reason.shoulder': 'Trajectoire adaptée à l’épaule',
  'injury.reason.wrist_elbow': 'Poignet en position neutre',
  'injury.reason.hip': 'Mouvement adapté à la hanche',
  'injury.reason.neck': 'Moins de contrainte sur la nuque',
  'result.adapted': 'Adapté pour vous',
  'result.adaptedSub': 'Exercices modifiés à cause des articulations signalées.',
  'dash.adaptedOne': '1 exercice adapté',
  'dash.adaptedMany': '{n} exercices adaptés',
  'dash.adaptedTitle': 'Adapté à vos articulations',
  'wizard.equipment.q': 'Avec quoi pouvez-vous vous entraîner ?',
  'wizard.eq.barbell': 'barre',
  'wizard.eq.dumbbell': 'haltères',
  'wizard.eq.rack': 'rack',
  'wizard.eq.cables': 'poulies',
  'wizard.eq.machines': 'machines',
  'wizard.eq.bodyweight': 'poids du corps',
  'wizard.s4.title': 'Nutrition & récupération',
  'wizard.diet': 'Préférence alimentaire',
  'wizard.diet.standard': 'Standard / omnivore',
  'wizard.diet.vegetarian': 'Végétarien',
  'wizard.diet.vegan': 'Végétalien',
  'wizard.diet.keto': 'Cétogène',
  'wizard.diet.paleo': 'Paléo',
  'wizard.sleep': 'Sommeil moyen (heures par nuit)',

  'result.saved': 'Enregistré sur Neon',
  'result.savedShort': 'enregistré sur Neon',
  'result.title1': 'Votre',
  'result.title2': 'programme',
  'result.meta': '{split} · {n} séances par semaine · {version}',
  'result.myPlans': 'Mes programmes',
  'result.startOver': 'Recommencer',
  'result.nutrition': 'Nutrition',
  'result.intake': 'Apport quotidien',
  'result.intakeSub': 'objectif kcal',
  'result.protein': 'Protéines',
  'result.proteinSub': '{pct} % des kcal',
  'result.carbs': 'Glucides',
  'result.carbsSub': 'carburant d’entraînement',
  'result.fat': 'Lipides',
  'result.fatSub': 'plancher hormonal',
  'result.math': 'MB {bmr} kcal · DEJ {tdee} kcal · ajusté à votre objectif',
  'result.training': 'Entraînement',
  'result.recovery': 'Récupération',
  'result.sleepDeload': 'Sommeil {sleep} h · deload toutes les {weeks} semaines',
  'result.roadmap': 'Feuille de route 12 semaines',

  'plans.eyebrow': 'Votre compte',
  'plans.title1': 'Salut {name},',
  'plans.title2': 'vos programmes',
  'plans.sub':
    'Chaque programme généré est enregistré sur votre compte. Ouvrez-en un pour voir le split, les macros et la feuille de route.',
  'plans.empty.title': 'Aucun programme pour l’instant',
  'plans.empty.sub': 'Quatre étapes et il apparaît ici, enregistré sur votre compte.',
  'plans.empty.cta': 'Créer mon programme',
  'plans.card.title': 'Programme #{id}',
  'plans.card.new': 'Nouveau programme',
  'plans.card.open': 'Ouvrir',
  'plans.card.saved': 'Enregistré',
  'plans.count': '{n} enregistré(s)',
  'plans.footer':
    "Tout est conservé sur votre compte : ouvrez un programme depuis n'importe quel appareil avec votre connexion.",
  'plans.engine.title': 'Comment ces programmes sont construits',
  'plans.engine.sub': 'Aucune sortie aléatoire : chaque programme vient du même moteur de règles, et les calculs sont affichés dans le programme.',
  'plans.engine.c1': 'Le calcul du corps',
  'plans.engine.c1b': 'Mifflin-St Jeor pour vos calories, puis les macros selon votre poids et votre objectif.',
  'plans.engine.c2': 'Le choix du split',
  'plans.engine.c2b': 'De 2 à 6 séances par semaine, selon votre expérience et votre matériel.',
  'plans.engine.c3': 'Les articulations',
  'plans.engine.c3b': 'Une articulation cochée remplace l’exercice chargé par le même mouvement, amplitude réduite.',
  'result.back': 'Retour',
  'plans.card.newSub': 'Quatre étapes, enregistré sur votre compte',
  'plans.opening': 'Ouverture de votre programme…',
  'plans.error': 'Impossible de charger vos programmes.',
  'plans.retry': 'Réessayer',

  'dash.greeting1': 'Salut {name} —',
  'dash.greeting2': 'semaine {week} sur 12',
  'dash.greetingEmpty1': 'Salut {name},',
  'dash.greetingEmpty2': 'créons votre programme',
  'dash.sub': 'Vos chiffres, le split de la semaine et le bloc en cours.',
  'dash.nextSession': 'Prochaine séance',
  'dash.subEmpty': 'Créez un programme et cette page devient votre base d’entraînement.',
  'dash.openFull': 'Ouvrir le programme complet',
  'dash.weekLabel': 'Semaine {n}',
  'dash.of12': 'sur 12 semaines',
  'dash.tile.kcalSub': 'MB {bmr} · DEJ {tdee}',
  'dash.tile.proteinSub': '{pct} % des calories',
  'dash.tile.sessionsSub': '{split}',
  'dash.blockNow': 'En cours',
  'dash.roadmapSub': 'Quatre blocs, un jalon chacun',
  'dash.goal': 'Objectif',
  'dash.kcal': 'Calories par jour',
  'dash.protein': 'Protéines',
  'dash.sessions': 'Séances',
  'dash.perWeek': '/ semaine',
  'dash.today': "aujourd'hui",
  'dash.weekOf': 'Semaine {n} sur 12',
  'dash.split': 'Le split de la semaine',
  'dash.startHere': 'Commencez ici',
  'dash.exercises': '{n} exercices',
  'dash.block': 'Bloc en cours',
  'dash.sleep': 'Sommeil {n} h',
  'dash.deload': 'Deload toutes les {n} semaines',
  'dash.openPlan': 'Ouvrir le programme',
  'dash.roadmap': 'Les 12 semaines',
  'dash.history': 'Historique',
  'dash.viewAll': 'Tout voir ({n})',
  'dash.active': 'Actif',
  'dash.updated': 'Mis à jour le {date}',
  'dash.empty.title': 'Votre tableau de bord attend un programme',
  'dash.empty.sub':
    'Quatre étapes — objectif, entraînement, alimentation, sommeil — et vous obtenez ici un split complet, des macros et une feuille de route sur 12 semaines.',
  'dash.empty.cta': 'Créer mon programme',
  'dash.empty.note': 'Environ une minute — sans carte bancaire.',
  'dash.tile1.title': 'Un split réalisable',
  'dash.tile1.body': 'Construit selon votre matériel, votre niveau et vos jours disponibles — pas un modèle qui suppose une salle complète.',
  'dash.tile2.title': 'Des chiffres, pas des intuitions',
  'dash.tile2.body': 'MB selon Mifflin-St Jeor, DEJ selon votre activité, puis calories et protéines pour votre objectif.',
  'dash.tile3.title': 'Une feuille de route de 12 semaines',
  'dash.tile3.body': 'Quatre blocs avec un jalon chacun, plus sommeil, deload et cardio.',

  'nav.account': 'Menu du compte',
  'nav.workspace': 'Espace',
  'nav.newPlan': 'Nouveau programme',
  'nav.needPlan': 'Un nouveau programme ?',
  'nav.needPlanBody': 'Quatre questions et un nouveau split arrive sur cette page.',
  'nav.currentPlan': 'Programme en cours',
  'nav.weekOf': 'Semaine {n}',
  'nav.openMenu': 'Ouvrir le menu',
  'nav.closeMenu': 'Fermer le menu',

  'hero.hello': 'Bonjour, {name} !',
  'hero.body': '{n} séances cette semaine · prochaine : {focus}.',

  'perf.title': 'Performance',
  'perf.sub': 'Séries par séance · {n} séances',
  'share.title': 'Répartition des macros',
  'share.sub': 'D’où viennent les calories',
  'share.kcal': 'kcal',
  'area.title': 'Profil de la semaine',
  'area.sub': 'Mouvements principaux vs accessoires',
  'dash.kcalDay': 'Calories / jour',
  'dash.sessionsCard': 'Séances',
  'dash.setsWeek': 'Séries de travail',
  'dash.col.session': 'Séance',
  'dash.col.focus': 'Focus',
  'dash.col.ex': 'Exercices',
  'dash.col.sets': 'Séries',
  'dash.col.time': 'Durée',
  'dash.weekVs': 'vs semaine dernière',

  'perf.weekly': 'séries cette semaine',
  'perf.best': 'Meilleure séance',
  'perf.setsShort': 'séries',
  'perf.primary': 'Mouvements principaux',
  'perf.accessory': 'Accessoires',
  'perf.avg': 'moy. {n}',
  'perf.all': 'Toutes les séances',
  'perf.chartAlt': 'Séries par séance',

  'dial.title': 'Vos chiffres',
  'dial.sub': 'Macros, apports et récupération, directement issus de votre programme',
  'dial.protein': 'Protéines',
  'dial.carbs': 'Glucides',
  'dial.fat': 'Lipides',
  'dial.intake': 'Apports / DEJ',
  'dial.sleep': 'Sommeil',
  'dial.block': 'Bloc',

  'split.title': 'Le split de la semaine',
  'split.see': 'Ouvrir le programme',

  'week.title': 'Cette semaine',
  'week.sub': '{n} séances au programme',
  'week.duration': '{n} min',

  'blocks.title': 'Blocs à venir',
  'blocks.seeAll': 'Tout voir',
  'blocks.weeks': 'Semaines {range}',

  'search.placeholder': 'Rechercher un exercice ou une séance',
  'search.empty': 'Créez un programme pour le rechercher',
  'search.none': 'Aucun résultat pour « {q} »',
  'search.clear': 'Effacer la recherche',

  'side.tipTitle': 'Cardio',

  'meals.title': 'Repas du jour',
  'meals.sub': '{n} repas dans votre programme',
  'history.row': '#{id} · {goal}',

  'goal.lose_fat': 'Perte de gras',
  'goal.build_muscle': 'Prise de muscle',
  'goal.recomp': 'Recomposition',
  'goal.athletic_performance': 'Performance',
  'goal.none': 'Votre programme',

  'err.apiDown': 'L’API est injoignable. Vérifiez que le serveur tourne.',
  'err.dbDown': 'La base de données est injoignable pour le moment. Réessayez dans un instant.',
  'err.signin': 'Connectez-vous pour continuer.',
  'err.credentials': 'E-mail ou mot de passe incorrect.',
  'err.taken': 'Un compte existe déjà avec cet e-mail.',
  'err.session': 'Votre session a expiré — reconnectez-vous.',
  'err.plan': 'Impossible de générer votre programme.',
  'err.openPlan': 'Impossible d’ouvrir ce programme.',
  'err.loggedOut': 'Déconnecté.',
  'err.saved': 'Programme enregistré sur votre compte.',
  'err.rate': 'Trop de tentatives. Réessayez dans 15 minutes.',
  'err.required': 'E-mail et mot de passe sont requis.',
  'err.profile': 'Vérifiez les valeurs saisies.',
  'err.unexpected': 'Erreur serveur inattendue. Réessayez.',
  'err.notFound': 'Cette page ou ce programme n’existe pas.',
  'app.generating': 'Calcul de votre programme et enregistrement sur Neon…',
};

const dictionaries: Record<Lang, Record<TKey, string>> = { en, fr };

export type Lang = 'en' | 'fr';
const STORAGE_KEY = 'trainwise.lang';

type I18n = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  /** Translate a sentence that came back from the API, when we recognise it. */
  tError: (message: string) => string;
};

const I18nContext = createContext<I18n | null>(null);

/** Server messages are English; map the ones a user can actually provoke. */
const errorMap: Record<string, TKey> = {
  'Sign in to continue.': 'err.signin',
  'Enter a valid email address.': 'auth.err.email',
  'Email or password is incorrect.': 'err.credentials',
  'An account with that email already exists.': 'err.taken',
  'That email already has an account. Sign in instead.': 'err.taken',
  'Email and password are required.': 'err.required',
  'Too many attempts. Try again in 15 minutes.': 'err.rate',
  'Invalid profile': 'err.profile',
  'Unexpected server error.': 'err.unexpected',
  'not found': 'err.notFound',
  'database unavailable': 'err.dbDown',
  'database not configured': 'err.dbDown',
  'Could not create the account — is Neon reachable?': 'err.dbDown',
  'Could not sign in — is Neon reachable?': 'err.dbDown',
  'could not save the blueprint — is Neon reachable?': 'err.dbDown',
  'API unreachable — is `npm run dev:api` running?': 'err.apiDown',
  'Neon is not reachable. Check DATABASE_URL in .env, then run `npm run db:push`.': 'err.dbDown',
};

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {
    // private mode, no storage — fall through to the browser language
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // not being able to remember the choice is not worth an error
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18n>(() => {
    const dict = dictionaries[lang];
    const t = (key: TKey, vars?: Record<string, string | number>) => {
      let out = dict[key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
      }
      return out;
    };
    return { lang, setLang, t, tError: (message) => (errorMap[message] ? t(errorMap[message]) : message) };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
};

/** EN | FR pill. Small on purpose: it should be findable, not loud. */
/**
 * The plan engine writes its focus lines, milestones and cardio notes in
 * English. Translating every exercise name is a bigger job, but these short
 * generated phrases are what the dashboard shows, so they get a lookup table.
 */
const PLAN_FR: Record<string, string> = {
  Strength: 'Force',
  Hypertrophy: 'Hypertrophie',
  Hinge: 'Charnière',
  'Squat / press': 'Squat / développé',
  'Hinge / pull': 'Charnière / tirage',
  'Volume / accessory': 'Volume / accessoires',
  'Chest / delts / triceps': 'Pectoraux / épaules / triceps',
  'Back / biceps': 'Dos / biceps',
  'Squat pattern': 'Mouvement squat',
  'Hinge pattern': 'Mouvement charnière',
  'Volume / weak points': 'Volume / points faibles',
  'Movement / core': 'Mouvement / gainage',
  Calibration: 'Calibration',
  Accumulation: 'Accumulation',
  Intensification: 'Intensification',
  'Deload + re-test': 'Décharge + re-test',
  'Baseline lifts and measurements logged': 'Charges et mesures de référence enregistrées',
  '+5–8% load on main lifts, adherence ≥ 85%': '+5–8 % de charge sur les mouvements principaux, assiduité ≥ 85 %',
  'Hold main-lift loads, adherence ≥ 85%, steps at target':
    'Maintenir les charges, assiduité ≥ 85 %, pas à l’objectif',
  '+2 to 3 kg lean mass': '+2 à 3 kg de masse maigre',
  '−1.5 to 2.5 kg body weight, lifts held': '−1,5 à 2,5 kg de poids, charges maintenues',
  'Deload week, then re-run the assessment and regenerate':
    'Semaine de décharge, puis refaire le bilan et régénérer',
  '2 × 20 min zone-2 for heart health, not fat loss.':
    '2 × 20 min en zone 2 pour le cœur, pas pour perdre du gras.',
  '3 × 30 min zone-2 plus 8k steps daily.': '3 × 30 min en zone 2 + 8 000 pas par jour.',
  'Full body × 3': 'Corps entier × 3',
  'Upper / lower × 4': 'Haut / bas × 4',
  'Push / pull / legs × 5': 'Poussé / tiré / jambes × 5',
  Breakfast: 'Petit-déjeuner',
  Lunch: 'Déjeuner',
  Dinner: 'Dîner',
  'Pre/post session': 'Avant / après séance',
  'Around training — fast carbs + whey': 'Autour de la séance — glucides rapides + whey',
  'Whole-food anchor, 30 g+ protein': 'Aliments bruts, 30 g de protéines minimum',
  'Double progression: run the rep range to the top, then add the smallest load jump.':
    'Double progression : montez la fourchette de répétitions, puis ajoutez la plus petite charge.',
  'Hold the loads, shorten rest by 15 s each week. Muscle retention beats PRs here.':
    'Gardez les charges, réduisez le repos de 15 s chaque semaine. Ici, garder du muscle compte plus que les records.',
  '2 × interval session plus 2 × 20 min zone-2.': '2 séances de fractionné + 2 × 20 min en zone 2.',
  '3 × 30 min zone-2, keep it easy on joint recovery days':
    '3 × 30 min en zone 2, sans forcer les jours de récupération',
  'Morning resting HR and grip strength — if both drop for 3 days, take a deload.':
    'FC de repos au réveil et force de préhension — si les deux baissent 3 jours de suite, faites une décharge.',
};

/** Plan text in the active language, falling back to the engine's English. */
export const planText = (lang: 'en' | 'fr', text: string) => (lang === 'fr' ? PLAN_FR[text] ?? text : text);

export const LanguageToggle = ({ className = '' }: { className?: string }) => {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language / Langue"
      className={`inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 ${className}`}
    >
      {(['en', 'fr'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`min-h-[30px] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
            lang === code ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
};
