// React is een JavaScript library voor het bouwen van gebruikersinterfaces
// useState is een "hook" waarmee we data kunnen opslaan die kan veranderen
import React, { useState } from 'react';

// Dit importeert iconen uit de Lucide icon library
// Deze iconen gebruiken we voor vinkjes, kruisjes, pijltjes etc.
import { ChevronRight, CheckCircle2, XCircle, HelpCircle, AlertCircle } from 'lucide-react';

// Dit is onze hoofdcomponent - de "functie" die onze hele app bevat
const MboSubsidieChecker = () => {
  
  // ===== STATE VARIABELEN =====
  // Deze variabelen onthouden informatie die kan veranderen tijdens het gebruik
  // useState('start') betekent: begin met waarde 'start'
  
  // Houdt bij op welk scherm we zitten: 'start', 'vragen', of 'resultaten'
  const [currentStep, setCurrentStep] = useState('start');
  
  // Houdt bij welke subsidie we nu behandelen (0 = eerste, 1 = tweede, etc.)
  const [currentSubsidieIndex, setCurrentSubsidieIndex] = useState(0);
  
  // Houdt bij welke vraag we stellen binnen die subsidie (0 = eerste vraag, etc.)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Object dat alle antwoorden opslaat - als een digitaal notitieboekje
  const [antwoorden, setAntwoorden] = useState({});
  
  // Object dat de berekende resultaten opslaat voor elke subsidie
  const [resultaten, setResultaten] = useState({});

  // ===== SUBSIDIE DATA =====
  // Dit is een groot "object" (zoals een map/woordenboek) met alle subsidie informatie
  // Elk subsidie heeft een naam als "sleutel" en alle details als "waarde"
  const subsidies = {
    "Aanvullende Beurs (DUO)": {
      // Korte uitleg wat deze subsidie inhoudt
      korte_uitleg_subsidie: "Dit is extra geld van DUO als je ouders niet zoveel kunnen meebetalen aan je studie.",
      
      // Array (lijst) met alle vragen voor deze subsidie
      vragen: [
        {
          // De vraag die gesteld wordt
          tekst: "Woon je in Nederland en heb je de Nederlandse nationaliteit?",
          
          // Type vraag: "ja_nee" of "getal"
          type: "ja_nee",
          
          // Extra toelichting bij de vraag (optioneel)
          uitleg_extra_vraag: "Of heb je een verblijfsdocument waarmee je studiefinanciering mag krijgen?",
          
          // true = "ja" is het goede antwoord, false = "nee" is het goede antwoord
          voorwaarde_ja_positief: true,
          
          // Als iemand "nee" antwoordt, stop dan direct (geen verdere vragen)
          uitsluitend_indien_nee: true,
          
          // Uitleg waarom ze uitgesloten zijn bij "nee"
          reden_uitsluiting_nee: "Voor een aanvullende beurs moet je meestal in Nederland wonen en de Nederlandse nationaliteit hebben (of een speciaal verblijfsdocument).",
          
          // Hoeveel punten deze vraag waard is (hoger = belangrijker)
          gewicht: 10,
        },
        {
          tekst: "Doe je een voltijd mbo-opleiding (BOL)?",
          type: "ja_nee",
          uitleg_extra_vraag: "BOL betekent dat je het grootste deel van de week naar school gaat.",
          voorwaarde_ja_positief: true,
          uitsluitend_indien_nee: true,
          reden_uitsluiting_nee: "De aanvullende beurs is meestal voor studenten die een voltijd BOL-opleiding doen.",
          gewicht: 10,
        },
        {
          // Dit is een "getal" vraag in plaats van ja/nee
          tekst: "Hoeveel verdienen je ouders/verzorgers ongeveer samen in een heel jaar (bruto, dus voordat de belasting eraf gaat)?",
          type: "getal",
          uitleg_extra_vraag: "Een schatting is prima. Als je het niet weet, vraag het even na of vul 0 in (dan kijken we later verder).",
          
          // Als het ingevulde getal LAGER is dan deze waarde, krijg je punten
          max_waarde_positief: 50000,  // Lager inkomen = beter voor subsidie
          gewicht: 5,
        },
      ],
      // Minimale score die je nodig hebt om in aanmerking te komen
      drempel_score: 20,
      
      // Link waar mensen meer info kunnen vinden
      info_link: "Zoek op 'aanvullende beurs mbo duo' voor de officiële info.",
    },
    "Studentenreisproduct (OV-kaart van DUO)": {
      korte_uitleg_subsidie: "Hiermee kun je gratis of met korting reizen met het openbaar vervoer.",
      vragen: [
        {
          tekst: "Woon je in Nederland en heb je de Nederlandse nationaliteit?",
          type: "ja_nee",
          uitleg_extra_vraag: "Of heb je een verblijfsdocument waarmee je studiefinanciering mag krijgen?",
          voorwaarde_ja_positief: true,
          uitsluitend_indien_nee: true,
          reden_uitsluiting_nee: "Voor het studentenreisproduct moet je meestal in Nederland wonen en de Nederlandse nationaliteit hebben (of een speciaal verblijfsdocument).",
          gewicht: 10,
        },
        {
          tekst: "Doe je een voltijd mbo-opleiding (BOL)?",
          type: "ja_nee",
          uitleg_extra_vraag: "BOL betekent dat je het grootste deel van de week naar school gaat.",
          voorwaarde_ja_positief: true,
          uitsluitend_indien_nee: true,
          reden_uitsluiting_nee: "Voor het studentenreisproduct moet je meestal een voltijd BOL-opleiding doen.",
          gewicht: 10,
        },
        {
          tekst: "Ben je jonger dan 30 als je met je studie begint of bent begonnen?",
          type: "ja_nee",
          voorwaarde_ja_positief: true,
          uitsluitend_indien_nee: true,
          reden_uitsluiting_nee: "Voor het studentenreisproduct moet je meestal jonger dan 30 zijn als je start.",
          gewicht: 5,
        }
      ],
      drempel_score: 25,
      info_link: "Zoek op 'studentenreisproduct mbo duo' voor de officiële info.",
    },
    "Zorgtoeslag (van de Belastingdienst)": {
      korte_uitleg_subsidie: "Dit is een bijdrage voor de kosten van je Nederlandse zorgverzekering.",
      vragen: [
        {
          tekst: "Ben je 18 jaar of ouder?",
          type: "ja_nee",
          voorwaarde_ja_positief: true,
          uitsluitend_indien_nee: true,
          reden_uitsluiting_nee: "Zorgtoeslag is meestal vanaf 18 jaar.",
          gewicht: 10,
        },
        {
          tekst: "Heb je een Nederlandse zorgverzekering (of ben je van plan die snel te nemen)?",
          type: "ja_nee",
          voorwaarde_ja_positief: true,
          uitsluitend_indien_nee: true,
          reden_uitsluiting_nee: "Je hebt een Nederlandse zorgverzekering nodig voor zorgtoeslag.",
          gewicht: 10,
        },
        {
          tekst: "Hoeveel verdien je zelf ongeveer in een heel jaar (bruto)?",
          type: "getal",
          uitleg_extra_vraag: "Denk aan loon uit een bijbaan. Studiefinanciering en toeslagen tellen niet mee.",
          max_waarde_positief: 30000,
          gewicht: 5,
        },
        {
          // Deze vraag heeft een speciaal geval: "nee" is hier het goede antwoord
          tekst: "Heb je veel spaargeld of ander vermogen (meer dan ongeveer 140.000 euro in 2024)?",
          type: "ja_nee",
          uitleg_extra_vraag: "Een beetje spaargeld mag, maar als je heel veel hebt, krijg je meestal geen zorgtoeslag.",
          
          // false betekent: "nee" is het goede antwoord (weinig spaargeld = goed)
          voorwaarde_ja_positief: false,
          
          // Als iemand "ja" antwoordt (veel geld), stop dan direct
          uitsluitend_indien_ja: true,
          reden_uitsluiting_ja: "Als je veel spaargeld of vermogen hebt, krijg je meestal geen zorgtoeslag.",
          gewicht: 5,
        },
      ],
      drempel_score: 25,
      info_link: "Zoek op 'zorgtoeslag belastingdienst' voor de officiële info.",
    },
  };

  // ===== HULP VARIABELEN =====
  // Object.keys() haalt alle "sleutels" (namen) uit het subsidies object
  // Dit geeft ons een lijst: ["Aanvullende Beurs (DUO)", "Studentenreisproduct...", etc.]
  const subsidieNamen = Object.keys(subsidies);

  // ===== HOOFDFUNCTIES =====
  
  // Deze functie wordt aangeroepen als iemand een vraag beantwoordt
  const handleAnswer = (antwoord) => {
    // Zoek uit welke subsidie en vraag we nu behandelen
    const huidigSubsidie = subsidieNamen[currentSubsidieIndex];
    const huidigVraag = subsidies[huidigSubsidie].vragen[currentQuestionIndex];
    
    // Sla het antwoord op in ons "notitieboekje"
    // De sleutel is bijv: "Aanvullende Beurs (DUO)_0" voor de eerste vraag van die subsidie
    const nieuwAntwoorden = {
      ...antwoorden, // Behoud alle oude antwoorden
      [`${huidigSubsidie}_${currentQuestionIndex}`]: antwoord // Voeg nieuwe toe
    };
    setAntwoorden(nieuwAntwoorden); // Sla de nieuwe staat op

    // ===== CHECK UITSLUITINGSCRITERIA =====
    // Sommige vragen kunnen iemand direct uitsluiten
    // Check of we moeten stoppen met deze subsidie (uitsluitend criterium)
    if (huidigVraag.type === 'ja_nee') {
      const jaAntwoord = antwoord === 'ja'; // true als antwoord "ja" is, false als "nee"
      
      // Als de vraag zegt "stop bij nee" en iemand antwoordt nee
      if (huidigVraag.uitsluitend_indien_nee && !jaAntwoord) {
        // Sla op dat deze persoon uitgesloten is voor deze subsidie
        setResultaten(prev => ({
          ...prev, // Behoud andere resultaten
          [huidigSubsidie]: {
            uitgesloten: true,
            reden: huidigVraag.reden_uitsluiting_nee
          }
        }));
        volgendSubsidie(); // Ga naar de volgende subsidie
        return; // Stop hier, ga niet verder met deze subsidie
      }
      
      // Als de vraag zegt "stop bij ja" en iemand antwoordt ja
      if (huidigVraag.uitsluitend_indien_ja && jaAntwoord) {
        setResultaten(prev => ({
          ...prev,
          [huidigSubsidie]: {
            uitgesloten: true,
            reden: huidigVraag.reden_uitsluiting_ja
          }
        }));
        volgendSubsidie();
        return;
      }
    }

    // ===== GA NAAR VOLGENDE VRAAG OF SUBSIDIE =====
    // Als er nog meer vragen zijn voor deze subsidie
    if (currentQuestionIndex < subsidies[huidigSubsidie].vragen.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); // Ga naar volgende vraag
    } else {
      // Alle vragen voor deze subsidie zijn beantwoord
      // Bereken de totale score voor deze subsidie
      berekenScore(huidigSubsidie, nieuwAntwoorden);
      volgendSubsidie(); // Ga naar volgende subsidie
    }
  };

  // Deze functie berekent hoeveel punten iemand krijgt voor een subsidie
  const berekenScore = (subsidieName, alleAntwoorden) => {
    const subsidie = subsidies[subsidieName]; // Haal de subsidie data op
    let score = 0; // Begin met 0 punten

    // Ga door alle vragen van deze subsidie
    subsidie.vragen.forEach((vraag, index) => {
      // Haal het antwoord op deze vraag op
      const antwoord = alleAntwoorden[`${subsidieName}_${index}`];
      
      // ===== PUNTEN VOOR JA/NEE VRAGEN =====
      if (vraag.type === 'ja_nee') {
        const jaAntwoord = antwoord === 'ja';
        // Als het antwoord overeenkomt met wat "goed" is voor deze vraag
        if (jaAntwoord === vraag.voorwaarde_ja_positief) {
          score += vraag.gewicht; // Voeg punten toe
        }
      } 
      // ===== PUNTEN VOOR GETAL VRAGEN =====
      else if (vraag.type === 'getal') {
        const getalAntwoord = parseInt(antwoord) || 0; // Zet antwoord om naar getal
        
        // Als er een maximum is en het getal is lager of gelijk
        if (vraag.max_waarde_positief && getalAntwoord <= vraag.max_waarde_positief) {
          score += vraag.gewicht;
        }
        // Als er een minimum is en het getal is hoger of gelijk  
        if (vraag.min_waarde_positief && getalAntwoord >= vraag.min_waarde_positief) {
          score += vraag.gewicht;
        }
      }
    });

    // Sla het resultaat op
    setResultaten(prev => ({
      ...prev,
      [subsidieName]: {
        score: score,
        drempel: subsidie.drempel_score,
        link: subsidie.info_link
      }
    }));
  };

  // Deze functie gaat naar de volgende subsidie (of naar resultaten als we klaar zijn)
  const volgendSubsidie = () => {
    // Als er nog meer subsidies zijn
    if (currentSubsidieIndex < subsidieNamen.length - 1) {
      setCurrentSubsidieIndex(currentSubsidieIndex + 1); // Ga naar volgende subsidie
      setCurrentQuestionIndex(0); // Begin weer bij vraag 0
    } else {
      // Alle subsidies zijn behandeld, ga naar resultatenscherm
      setCurrentStep('resultaten');
    }
  };

  // Deze functie start de vragenlijst
  const startChecker = () => {
    setCurrentStep('vragen');
    setCurrentSubsidieIndex(0);
    setCurrentQuestionIndex(0);
    setAntwoorden({});
    setResultaten({});
  };

  // Deze functie reset alles en gaat terug naar het begin
  const opnieuwBeginnen = () => {
    setCurrentStep('start');
    setCurrentSubsidieIndex(0);
    setCurrentQuestionIndex(0);
    setAntwoorden({});
    setResultaten({});
  };

  // ===== WELKOMSTSCHERM =====
  // Als we op het startscherm zijn, toon dit
  if (currentStep === 'start') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🎓 MBO Subsidie Hulp
            </h1>
            <p className="text-lg text-gray-600 mb-2">Proefversie</p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-gray-700 leading-relaxed">
              Hoi! Ik ga je een paar vragen stellen om te kijken voor welke subsidies je misschien in aanmerking komt.
            </p>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <p className="text-gray-700 leading-relaxed">
              <strong>Belangrijk:</strong> Dit is een eerste check. Voor de echte aanvraag moet je altijd naar de officiële websites.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-gray-800">We kijken naar deze subsidies:</h3>
            {subsidieNamen.map((naam, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{naam}</h4>
                  <p className="text-sm text-gray-600 mt-1">{subsidies[naam].korte_uitleg_subsidie}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={startChecker}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>Laten we beginnen!</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ===== VRAGENSCHERM =====
  // Als we vragen aan het stellen zijn, toon dit scherm
  if (currentStep === 'vragen') {
    // Zoek uit welke subsidie en vraag we nu behandelen
    const huidigSubsidie = subsidieNamen[currentSubsidieIndex];
    const huidigVraag = subsidies[huidigSubsidie].vragen[currentQuestionIndex];
    
    // Bereken voortgang in percentage (hoeveel % van alle vragen hebben we gehad)
    // We schatten ongeveer 3 vragen per subsidie voor de berekening
    const voortgang = Math.round(((currentSubsidieIndex * 3 + currentQuestionIndex + 1) / (subsidieNamen.length * 3)) * 100);

    return (
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Voortgang</span>
              <span className="text-sm font-medium text-gray-600">{voortgang}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${voortgang}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{huidigSubsidie}</h2>
              <p className="text-gray-700">{subsidies[huidigSubsidie].korte_uitleg_subsidie}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{huidigVraag.tekst}</h3>
              
              {huidigVraag.uitleg_extra_vraag && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <HelpCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{huidigVraag.uitleg_extra_vraag}</p>
                  </div>
                </div>
              )}
            </div>

            {huidigVraag.type === 'ja_nee' ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleAnswer('ja')}
                  className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 text-green-800 font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Ja</span>
                </button>
                <button
                  onClick={() => handleAnswer('nee')}
                  className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 text-red-800 font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Nee</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Vul een bedrag in euro's in..."
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handleAnswer(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    if (input.value) {
                      handleAnswer(input.value);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Volgende vraag
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== RESULTATENSCHERM =====
  // Als alle vragen beantwoord zijn, toon de resultaten
  if (currentStep === 'resultaten') {
    // Filter uit welke subsidies iemand WEL kan krijgen
    // Object.entries() maakt van het resultaten object een lijst van [naam, info] paren
    const gevondenSubsidies = Object.entries(resultaten).filter(
      ([naam, info]) => !info.uitgesloten && info.score >= info.drempel
    );

    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🎉 Jouw Subsidie Overzicht
            </h1>
            <p className="text-lg text-gray-600">Hier zijn de resultaten van je check!</p>
          </div>

          <div className="space-y-6">
            {Object.entries(resultaten).map(([naam, info]) => (
              <div key={naam} className="border rounded-xl p-6">
                {info.uitgesloten ? (
                  <div className="flex items-start space-x-4">
                    <XCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{naam}</h3>
                      <p className="text-gray-600 mb-3">
                        Lijkt er niet in te zitten voor jou. De reden is waarschijnlijk: {info.reden}
                      </p>
                      <p className="text-sm text-gray-500">
                        Tip: Check het zelf goed na! {subsidies[naam].info_link}
                      </p>
                    </div>
                  </div>
                ) : info.score >= info.drempel ? (
                  <div className="flex items-start space-x-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{naam}</h3>
                      <p className="text-gray-600 mb-3">
                        Dit zou iets voor jou kunnen zijn! Je 'score' is {info.score} en je had {info.drempel} nodig.
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <strong>Tip:</strong> Check het zelf goed na! {info.link}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-4">
                    <HelpCircle className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{naam}</h3>
                      <p className="text-gray-600 mb-3">
                        Waarschijnlijk niet direct, of we hebben meer info nodig. Je 'score' is {info.score} (nodig: {info.drempel}).
                      </p>
                      <p className="text-sm text-gray-500">
                        Tip: Twijfel je? Check het toch even! {info.link}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {gevondenSubsidies.length === 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 mb-2">
                    Op basis van je antwoorden lijkt het erop dat je nu niet direct voor deze subsidies in aanmerking komt.
                  </p>
                  <p className="text-gray-700">
                    Maar geen paniek! Er zijn misschien andere potjes, of je situatie kan veranderen.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 my-8">
            <h3 className="font-bold text-gray-800 mb-3">BELANGRIJK OM TE WETEN:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Dit is een simpele proefversie en geeft alleen een idee.</li>
              <li>• De regels voor subsidies zijn ingewikkeld en veranderen soms.</li>
              <li>• Voor de echte aanvraag en de juiste info: ga ALTIJD naar de officiële websites (DUO.nl, Belastingdienst.nl/toeslagen, of je gemeente).</li>
              <li>• Je kunt hier geen rechten aan ontlenen. Succes!</li>
            </ul>
          </div>

          <button
            onClick={opnieuwBeginnen}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
          >
            Opnieuw beginnen
          </button>
        </div>
      </div>
    );
  }
};

// Export de component zodat andere bestanden hem kunnen gebruiken
// Dit is standaard in React - elke component moet ge-export worden
export default MboSubsidieChecker;
