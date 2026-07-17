export { InterviewTypeSchema, INTERVIEW_TYPES, INTERVIEW_LANGUAGES } from "./interview-types";
export type { InterviewType, InterviewLanguage } from "./interview-types";

export async function generateInterviewQuestions(data: {
  jobTitle: string;
  jobDescription: string;
  interviewType?: string;
  language?: string;
}): Promise<{ questions: string[] }> {
  const { jobTitle: title, interviewType, language } = data;
  const type = interviewType || "mixed";
  const lang = language || "en";

  // Question sets by language then type
  const questionSets: Record<string, Record<string, string[]>> = {
    en: {
      mixed: [
        `Describe a technical challenge you faced in a previous ${title} role and how you solved it.`,
        `Tell me about a time you had to collaborate with a difficult team member. How did you handle it?`,
        `What motivates you about this ${title} position and how does it align with your career goals?`,
      ],
      behavioral: [
        `Describe a situation where you had to meet a tight deadline as a ${title}. What was the outcome?`,
        `Tell me about a time you received critical feedback. How did you respond?`,
        `Give an example of when you had to make a difficult decision with incomplete information.`,
      ],
      technical: [
        `Walk me through your approach to solving a complex problem relevant to the ${title} role.`,
        `How would you debug a production issue in a system you're unfamiliar with?`,
        `Practical assessment: Given the job description, design a small solution that addresses the core technical requirements.`,
      ],
      practical: [
        `Build a small feature that demonstrates your core skills for the ${title} role.`,
        `Given a typical scenario for this position, walk through your step-by-step approach.`,
        `Debug this described issue: A key system component is returning incorrect results intermittently.`,
      ],
    },
    es: {
      mixed: [
        `Describe un desafío técnico que enfrentó en un puesto anterior de ${title} y cómo lo resolvió.`,
        `Cuénteme sobre una vez que tuvo que colaborar con un compañero de equipo difícil. ¿Cómo lo manejó?`,
        `¿Qué le motiva de este puesto de ${title} y cómo se alinea con sus objetivos profesionales?`,
      ],
      behavioral: [
        `Describe una situación en la que tuvo que cumplir un plazo ajustado como ${title}. ¿Cuál fue el resultado?`,
        `Cuénteme sobre una vez que recibió retroalimentación crítica. ¿Cómo respondió?`,
        `Dé un ejemplo de cuando tuvo que tomar una decisión difícil con información incompleta.`,
      ],
      technical: [
        `Explíqueme su enfoque para resolver un problema complejo relevante para el puesto de ${title}.`,
        `¿Cómo depuraría un problema en producción en un sistema con el que no está familiarizado?`,
        `Evaluación práctica: Dada la descripción del puesto, diseñe una pequeña solución que aborde los requisitos técnicos principales.`,
      ],
      practical: [
        `Construya una pequeña funcionalidad que demuestre sus habilidades principales para el puesto de ${title}.`,
        `Dado un escenario típico para esta posición, explique su enfoque paso a paso.`,
        `Depure este problema descrito: Un componente clave del sistema está devolviendo resultados incorrectos de forma intermitente.`,
      ],
    },
    fr: {
      mixed: [
        `Décrivez un défi technique que vous avez rencontré dans un poste précédent de ${title} et comment vous l'avez résolu.`,
        `Parlez-moi d'une fois où vous avez dû collaborer avec un collègue difficile. Comment avez-vous géré la situation?`,
        `Qu'est-ce qui vous motive dans ce poste de ${title} et comment s'aligne-t-il avec vos objectifs de carrière?`,
      ],
      behavioral: [
        `Décrivez une situation où vous avez dû respecter un délai serré en tant que ${title}. Quel a été le résultat?`,
        `Parlez-moi d'une fois où vous avez reçu des commentaires critiques. Comment avez-vous réagi?`,
        `Donnez un exemple d'une décision difficile que vous avez dû prendre avec des informations incomplètes.`,
      ],
      technical: [
        `Expliquez-moi votre approche pour résoudre un problème complexe pertinent pour le poste de ${title}.`,
        `Comment débogueriez-vous un problème en production dans un système que vous ne connaissez pas?`,
        `Évaluation pratique: Selon la description du poste, concevez une petite solution répondant aux exigences techniques principales.`,
      ],
      practical: [
        `Construisez une petite fonctionnalité démontrant vos compétences clés pour le poste de ${title}.`,
        `Pour un scénario typique de ce poste, décrivez votre approche étape par étape.`,
        `Déboguez ce problème: Un composant clé du système renvoie des résultats incorrects de manière intermittente.`,
      ],
    },
    de: {
      mixed: [
        `Beschreiben Sie eine technische Herausforderung, die Sie in einer früheren ${title}-Rolle bewältigt haben, und wie Sie sie gelöst haben.`,
        `Erzählen Sie von einer Situation, in der Sie mit einem schwierigen Teammitglied zusammenarbeiten mussten. Wie sind Sie damit umgegangen?`,
        `Was motiviert Sie an dieser ${title}-Position und wie passt sie zu Ihren Karrierezielen?`,
      ],
      behavioral: [
        `Beschreiben Sie eine Situation, in der Sie als ${title} eine knappe Frist einhalten mussten. Was war das Ergebnis?`,
        `Erzählen Sie von einer Situation, in der Sie kritisches Feedback erhalten haben. Wie haben Sie reagiert?`,
        `Geben Sie ein Beispiel für eine schwierige Entscheidung, die Sie mit unvollständigen Informationen treffen mussten.`,
      ],
      technical: [
        `Erklären Sie Ihren Ansatz zur Lösung eines komplexen Problems, das für die ${title}-Rolle relevant ist.`,
        `Wie würden Sie ein Produktionsproblem in einem System debuggen, mit dem Sie nicht vertraut sind?`,
        `Praktische Bewertung: Entwerfen Sie basierend auf der Stellenbeschreibung eine kleine Lösung, die die wichtigsten technischen Anforderungen erfüllt.`,
      ],
      practical: [
        `Erstellen Sie ein kleines Feature, das Ihre Kernkompetenzen für die ${title}-Rolle demonstriert.`,
        `Beschreiben Sie für ein typisches Szenario dieser Position Ihren schrittweisen Ansatz.`,
        `Debuggen Sie dieses Problem: Eine Schlüsselkomponente des Systems liefert zeitweise falsche Ergebnisse.`,
      ],
    },
    zu: {
      mixed: [
        `Chaza inselelo yezobuchwepheshe oyibhekane nayo esikhundleni sangaphambilini se-${title} nokuthi wayixazulula kanjani.`,
        `Ngitshele ngesikhathi lapho kwadingeka ubambisane nelunga leqembu elinzima. Wakubhekana kanjani nalokho?`,
        `Yini ekugqugquzelayo ngalesi sikhundla se-${title} futhi sihambisana kanjani nemigomo yakho yekharikhulamu?`,
      ],
      behavioral: [
        `Chaza isimo lapho kwadingeka uhlangabezane nesikhathi esinqunyelwe njenge-${title}. Kwaba yini umphumela?`,
        `Ngitshele ngesikhathi lapho wathola ukuphawula okubalulekile. Wasabela kanjani?`,
        `Nika isibonelo lapho kwadingeka uthathe isinqumo esinzima unolwazi olungaphelele.`,
      ],
      technical: [
        `Ngihambise ngendlela yakho yokuxazulula inkinga eyinkimbinkimbi ehlobene nesikhundla se-${title}.`,
        `Ungayilungisa kanjani inkinga yokukhiqiza ohlelweni ongajwayele?`,
        `Ukuhlolwa okungokoqobo: Uma kubhekwa incazelo yomsebenzi, klama isixazululo esincane esibhekana nezidingo zobuchwepheshe eziyisisekelo.`,
      ],
      practical: [
        `Yakha isici esincane esikhombisa amakhono akho ayisisekelo esikhundleni se-${title}.`,
        `Uma unikwa isimo esijwayelekile salesi sikhundla, hambisa ngendlela yakho yesinyathelo ngesinyathelo.`,
        `Lungisa le nkinga echazwayo: Ingxenye ebalulekile yohlelo ibuyisela imiphumela engalungile ngokungahlali njalo.`,
      ],
    },
    af: {
      mixed: [
        `Beskryf 'n tegniese uitdaging wat jy in 'n vorige ${title}-rol ervaar het en hoe jy dit opgelos het.`,
        `Vertel my van 'n keer toe jy met 'n moeilike spanmaat moes saamwerk. Hoe het jy dit hanteer?`,
        `Wat motiveer jou oor hierdie ${title}-pos en hoe pas dit by jou loopbaandoelwitte?`,
      ],
      behavioral: [
        `Beskryf 'n situasie waar jy as ${title} 'n streng sperdatum moes haal. Wat was die uitkoms?`,
        `Vertel my van 'n keer toe jy kritiese terugvoer ontvang het. Hoe het jy gereageer?`,
        `Gee 'n voorbeeld van wanneer jy 'n moeilike besluit met onvolledige inligting moes neem.`,
      ],
      technical: [
        `Loop my deur jou benadering om 'n komplekse probleem relevant tot die ${title}-rol op te los.`,
        `Hoe sou jy 'n produksieprobleem in 'n stelsel waarmee jy onbekend is, ontfout?`,
        `Praktiese assessering: Ontwerp 'n klein oplossing wat die kerntegniese vereistes aanspreek.`,
      ],
      practical: [
        `Bou 'n klein funksie wat jou kernvaardighede vir die ${title}-rol demonstreer.`,
        `Gegee 'n tipiese scenario vir hierdie pos, loop deur jou stap-vir-stap-benadering.`,
        `Ontfout hierdie beskryfde probleem: 'n Sleutelstelselkomponent lewer intermittend verkeerde resultate.`,
      ],
    },
  };

  // Get questions for the selected language, fall back to English
  const langQuestions = questionSets[lang] ?? questionSets.en;
  const questions = langQuestions[type] ?? langQuestions.mixed;

  return { questions };
}
