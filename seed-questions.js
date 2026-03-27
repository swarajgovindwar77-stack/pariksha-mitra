/**
 * FIRESTORE QUESTION SEEDER
 * ─────────────────────────────────────────────────────────────
 * Run this script ONCE to upload all your questions to Firestore.
 * After that, add new questions directly in Firebase Console
 * OR build an admin panel (see comments at bottom).
 *
 * HOW TO RUN:
 * 1. npm install firebase-admin
 * 2. Download your service account key from:
 *    Firebase Console → Project Settings → Service Accounts → Generate new private key
 * 3. Save it as serviceAccountKey.json in this folder
 * 4. node seed-questions.js
 * ─────────────────────────────────────────────────────────────
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ================================================================
// QUESTION BANK — Add as many questions as you want here
// Structure: QUESTIONS[exam][subject] = [ {q, opts, ans, exp}, ... ]
// ================================================================
const QUESTIONS = {
  MPSC: {
    History: [
      { q: "Who founded the Maratha Empire in 1674 CE?", opts: ["Bajirao I","Shivaji Maharaj","Sambhaji","Balaji Vishwanath"], ans: 1, exp: "Chhatrapati Shivaji Maharaj founded the Maratha Empire at Raigad.", difficulty: "easy", tags: ["maratha","founders"] },
      { q: "The Third Battle of Panipat (1761) was fought against?", opts: ["Mughals","British East India Company","Ahmad Shah Durrani","Nizam of Hyderabad"], ans: 2, exp: "Ahmad Shah Durrani defeated the Marathas at Panipat in 1761.", difficulty: "medium", tags: ["battles","panipat"] },
      { q: "Satyashodhak Samaj was founded in which year?", opts: ["1848","1873","1885","1906"], ans: 1, exp: "Mahatma Jyotiba Phule founded Satyashodhak Samaj in 1873.", difficulty: "medium", tags: ["social reform","phule"] },
      { q: "Which Peshwa is known as 'Thorale Bajirao'?", opts: ["Bajirao II","Bajirao I","Balaji Bajirao","Vishwanath"], ans: 1, exp: "Bajirao I (1700-1740) never lost a battle — hence 'Thorale' (Great).", difficulty: "medium", tags: ["peshwa"] },
      { q: "Chapekar Brothers assassinated which British officer in Pune (1897)?", opts: ["Lord Curzon","W.C. Rand","Charles Napier","Arthur Wellesley"], ans: 1, exp: "Damodar and Balkrishna Chapekar assassinated Plague Commissioner W.C. Rand in Pune, 1897.", difficulty: "hard", tags: ["freedom struggle","maharashtra"] },
      { q: "The Deccan Riots of 1875 were directed against?", opts: ["British revenue officers","Moneylenders and sahukars","Zamindars","Indigo planters"], ans: 1, exp: "Deccan Riots (1875) were peasant uprisings against exploitative moneylenders.", difficulty: "hard", tags: ["agrarian","riots"] },
      { q: "Who was the founder of Indian National Congress (1885)?", opts: ["Gopal Krishna Gokhale","Bal Gangadhar Tilak","A.O. Hume","Dadabhai Naoroji"], ans: 2, exp: "A.O. Hume, a retired British civil servant, founded INC in 1885.", difficulty: "easy", tags: ["INC","founders"] },
      { q: "The Revolt of 1857 started from which cantonment?", opts:["Delhi","Meerut","Kanpur","Lucknow"], ans: 1, exp: "The 1857 revolt began at Meerut on May 10, 1857 by sepoys.", difficulty: "easy", tags: ["1857 revolt"] },
      { q: "Mahatma Gandhi launched Dandi March in which year?", opts: ["1928","1929","1930","1931"], ans: 2, exp: "Dandi March (Salt March) was launched on March 12, 1930.", difficulty: "easy", tags: ["gandhi","salt march"] },
      { q: "Quit India Movement was launched on?", opts: ["August 8, 1940","August 8, 1942","August 15, 1942","January 26, 1942"], ans: 1, exp: "Quit India Movement was launched on August 8, 1942 at Bombay.", difficulty: "easy", tags: ["quit india","gandhi"] },
    ],
    Geography: [
      { q: "Longest river in Maharashtra?", opts: ["Krishna","Godavari","Bhima","Tapi"], ans: 1, exp: "Godavari (Dakshin Ganga) is Maharashtra's longest river, originates at Trimbakeshwar near Nashik.", difficulty: "easy", tags: ["rivers","maharashtra"] },
      { q: "Lonar Lake was formed by?", opts: ["Volcanic activity","Meteorite impact","Tectonic movement","Human construction"], ans: 1, exp: "Lonar Lake in Buldhana formed by meteorite impact ~50,000 years ago. A National Geo-heritage Monument.", difficulty: "medium", tags: ["lakes","buldhana"] },
      { q: "Western Ghats locally known as in Maharashtra?", opts: ["Vindhya","Satpura","Sahyadri","Aravalli"], ans: 2, exp: "Western Ghats = Sahyadri in Maharashtra. UNESCO World Heritage Site.", difficulty: "easy", tags: ["mountains","sahyadri"] },
      { q: "Highest peak in Maharashtra?", opts: ["Harishchandragad","Sinhagad","Kalsubai","Rajgad"], ans: 2, exp: "Kalsubai (1,646m) in Ahmednagar district is Maharashtra's highest peak.", difficulty: "medium", tags: ["peaks","ahmednagar"] },
      { q: "Which district has the highest forest cover in Maharashtra?", opts: ["Nashik","Gadchiroli","Chandrapur","Raigad"], ans: 1, exp: "Gadchiroli (~80% forest cover) has the highest forest cover in Maharashtra.", difficulty: "medium", tags: ["forests","gadchiroli"] },
      { q: "Bhor Ghat connects which two cities?", opts: ["Nashik-Pune","Mumbai-Pune","Nashik-Mumbai","Aurangabad-Pune"], ans: 1, exp: "Bhor Ghat (Khandala-Khopoli) connects Mumbai and Pune via Western Ghats.", difficulty: "medium", tags: ["passes","ghats"] },
    ],
    Polity: [
      { q: "Maharashtra Vidhan Sabha has how many seats?", opts: ["234","288","240","296"], ans: 1, exp: "Maharashtra Legislative Assembly has 288 seats.", difficulty: "easy", tags: ["maharashtra","legislature"] },
      { q: "Article 356 deals with?", opts: ["War Emergency","President's Rule","Financial Emergency","Amendment"], ans: 1, exp: "Article 356 — State Emergency / President's Rule when constitutional machinery fails.", difficulty: "easy", tags: ["constitution","articles"] },
      { q: "8th Schedule of Indian Constitution lists?", opts: ["Fundamental Rights","Official Languages","Union-State subjects","Emergency Provisions"], ans: 1, exp: "8th Schedule: 22 officially recognized languages including Marathi.", difficulty: "easy", tags: ["constitution","schedules"] },
      { q: "73rd Constitutional Amendment gave constitutional status to?", opts: ["Urban local bodies","Panchayati Raj","High Courts","Election Commission"], ans: 1, exp: "73rd Amendment (1992) → Part IX + 11th Schedule → Constitutional status to PRIs.", difficulty: "medium", tags: ["amendment","panchayat"] },
      { q: "Which article guarantees Right to Education (6-14 years)?", opts: ["Article 19","Article 21","Article 21A","Article 32"], ans: 2, exp: "Article 21A (added by 86th Amendment, 2002) — free and compulsory education for 6-14 years.", difficulty: "medium", tags: ["fundamental rights","education"] },
    ],
    Economy: [
      { q: "Maharashtra's share in India's industrial output?", opts: ["10%","15%","25%","35%"], ans: 2, exp: "Maharashtra contributes ~25% of India's industrial output, ~14% of national GDP.", difficulty: "medium", tags: ["economy","industry"] },
      { q: "MIDC stands for?", opts: ["Maharashtra Industrial Development Corporation","Maharashtra Investment Development Council","Ministry of Industrial Development","Maharashtra Infrastructure Development Committee"], ans: 0, exp: "MIDC (Maharashtra Industrial Development Corporation) est. 1962.", difficulty: "easy", tags: ["MIDC","abbreviations"] },
      { q: "BSE was established in which year?", opts: ["1860","1875","1900","1920"], ans: 1, exp: "BSE (1875) is Asia's oldest stock exchange, located at Dalal Street, Mumbai.", difficulty: "medium", tags: ["BSE","stock exchange"] },
      { q: "Cotton is called 'White Gold' in which region of Maharashtra?", opts: ["Konkan","Marathwada","Vidarbha","Western Maharashtra"], ans: 2, exp: "Cotton = White Gold in Vidarbha. Major cotton-growing region of Maharashtra.", difficulty: "easy", tags: ["agriculture","vidarbha"] },
      { q: "Samruddhi Mahamarg connects?", opts: ["Mumbai–Pune","Nagpur–Mumbai","Nashik–Aurangabad","Pune–Nagpur"], ans: 1, exp: "Nagpur–Mumbai Super Communication Expressway = Samruddhi Mahamarg (701 km).", difficulty: "easy", tags: ["infrastructure","expressway"] },
    ],
    Science: [
      { q: "SI unit of electric current?", opts: ["Volt","Ohm","Watt","Ampere"], ans: 3, exp: "Ampere (A) is the SI base unit of electric current.", difficulty: "easy", tags: ["physics","units"] },
      { q: "Deficiency of Vitamin D leads to?", opts: ["Scurvy","Rickets","Night blindness","Beri-beri"], ans: 1, exp: "Vitamin D deficiency → Rickets (children), Osteomalacia (adults).", difficulty: "easy", tags: ["biology","vitamins"] },
      { q: "Powerhouse of the cell?", opts: ["Nucleus","Ribosome","Mitochondria","Golgi Body"], ans: 2, exp: "Mitochondria produce ATP via cellular respiration — powerhouse of the cell.", difficulty: "easy", tags: ["biology","cell"] },
      { q: "Ozone layer is in which atmospheric layer?", opts: ["Troposphere","Stratosphere","Mesosphere","Thermosphere"], ans: 1, exp: "Ozone layer in stratosphere (15-35 km altitude) absorbs UV radiation.", difficulty: "easy", tags: ["environment","atmosphere"] },
      { q: "Which gas has the highest concentration in Earth's atmosphere?", opts: ["Oxygen","Carbon Dioxide","Nitrogen","Argon"], ans: 2, exp: "Nitrogen (N₂) = ~78% of Earth's atmosphere. Oxygen = ~21%.", difficulty: "easy", tags: ["atmosphere","gases"] },
    ],
    'Current Affairs': [
      { q: "Samruddhi Mahamarg's official name includes which personality?", opts: ["Atal Bihari Vajpayee","Balasaheb Thackeray","Ambedkar","Narendra Modi"], ans: 1, exp: "Official name: 'Hindu Hrudaysamrat Balasaheb Thackeray Maharashtra Samruddhi Mahamarg'.", difficulty: "medium", tags: ["current affairs","infrastructure"] },
      { q: "Namo Shetkari Mahasanman Nidhi provides farmers?", opts: ["₹2000/year","₹6000/year","₹12000/year","₹18000/year"], ans: 1, exp: "Scheme provides ₹6000/year additionally on top of PM-KISAN's ₹6000.", difficulty: "medium", tags: ["schemes","farmers"] },
      { q: "ONORC scheme was launched to?", opts: ["Provide free ration","Enable ration card portability","Double ration entitlement","Digitize ration cards only"], ans: 1, exp: "One Nation One Ration Card enables portability of ration cards across states.", difficulty: "medium", tags: ["schemes","ration"] },
    ],
  },

  // Add UPSC, SSC, Banking questions following the same pattern
  UPSC: {
    History: [
      { q: "Indus Valley Civilization was discovered in which year?", opts: ["1910","1921","1935","1947"], ans: 1, exp: "IVC was discovered in 1921 when Harappa was excavated by Daya Ram Sahni.", difficulty: "medium", tags: ["ancient india","IVC"] },
      { q: "First Governor-General of independent India?", opts: ["Lord Mountbatten","C. Rajagopalachari","Rajendra Prasad","B.R. Ambedkar"], ans: 0, exp: "Lord Mountbatten served as first Governor-General of independent India (1947-48).", difficulty: "medium", tags: ["independence","governor general"] },
    ],
    Polity: [
      { q: "Indian Constitution was adopted on?", opts: ["August 15, 1947","January 26, 1949","November 26, 1949","January 26, 1950"], ans: 2, exp: "Constitution was adopted on November 26, 1949 (Constitution Day). Came into effect January 26, 1950.", difficulty: "easy", tags: ["constitution","important dates"] },
    ],
  },

  SSC: {
    Reasoning: [
      { q: "Odd one out: 8, 27, 64, 100, 125", opts: ["8","27","100","125"], ans: 2, exp: "8,27,64,125 are perfect cubes (2³,3³,4³,5³). 100=10² is not a cube.", difficulty: "medium", tags: ["number series","cubes"] },
      { q: "Complete: 1, 4, 9, 16, 25, ?", opts: ["30","36","35","49"], ans: 1, exp: "Perfect squares: 1²,2²,3²,4²,5²,6²=36.", difficulty: "easy", tags: ["number series","squares"] },
      { q: "Ravi is 11th from left in a row of 40. Position from right?", opts: ["29th","30th","31st","28th"], ans: 1, exp: "From right = Total − From left + 1 = 40−11+1 = 30.", difficulty: "easy", tags: ["seating arrangement"] },
    ],
    Maths: [
      { q: "Simple interest on ₹5000 at 8% for 3 years?", opts: ["₹1000","₹1200","₹1400","₹1500"], ans: 1, exp: "SI = P×R×T/100 = 5000×8×3/100 = ₹1200.", difficulty: "easy", tags: ["simple interest"] },
      { q: "LCM of 12, 18, 24?", opts: ["36","48","72","96"], ans: 2, exp: "LCM = 2³×3² = 72.", difficulty: "medium", tags: ["LCM","HCF"] },
      { q: "15% of 840?", opts: ["120","126","130","124"], ans: 1, exp: "15/100 × 840 = 126.", difficulty: "easy", tags: ["percentage"] },
    ],
  },
};

// ================================================================
// SEEDER FUNCTION
// ================================================================
async function seedQuestions() {
  let totalUploaded = 0;
  let totalSkipped = 0;

  for (const [exam, subjects] of Object.entries(QUESTIONS)) {
    for (const [subject, questions] of Object.entries(subjects)) {
      console.log(`\n📚 Uploading: ${exam} → ${subject} (${questions.length} questions)`);

      for (const [index, q] of questions.entries()) {
        try {
          // Use a stable ID based on content hash to avoid duplicates
          const docId = Buffer.from(q.q).toString('base64').slice(0, 20);
          const ref = db.collection('questions').doc(exam).collection(subject).doc(docId);

          // Check if already exists
          const existing = await ref.get();
          if (existing.exists) {
            console.log(`  ⏭️  Skipping (exists): ${q.q.slice(0, 50)}...`);
            totalSkipped++;
            continue;
          }

          await ref.set({
            ...q,
            exam,
            subject,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          totalUploaded++;
          console.log(`  ✅ [${index + 1}/${questions.length}] ${q.q.slice(0, 60)}...`);
        } catch (err) {
          console.error(`  ❌ Error uploading question: ${err.message}`);
        }
      }
    }
  }

  console.log('\n════════════════════════════════════');
  console.log(`✅ Seeding complete!`);
  console.log(`   Uploaded: ${totalUploaded} questions`);
  console.log(`   Skipped (already exist): ${totalSkipped}`);
  console.log('════════════════════════════════════');
  process.exit(0);
}

seedQuestions().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

/*
 * ================================================================
 * ADDING QUESTIONS LATER (without running this script again)
 * ================================================================
 *
 * Option 1 — Firebase Console (easiest):
 * 1. Go to console.firebase.google.com
 * 2. Firestore Database → questions → MPSC → History → Add document
 * 3. Add fields: q (string), opts (array), ans (number), exp (string)
 *
 * Option 2 — Build an Admin Panel:
 * Create a separate admin.html file with a form that writes to Firestore.
 * Protect it with Firebase Auth role checks:
 *   if (user.email !== 'youremail@gmail.com') return; // admin only
 *
 * Option 3 — Google Sheets → Firestore:
 * Use Apps Script to export rows from a Google Sheet to Firestore.
 * Great for managing 1000+ questions in a spreadsheet.
 *
 * Question document structure:
 * {
 *   q: "Question text here?",
 *   opts: ["Option A", "Option B", "Option C", "Option D"],
 *   ans: 0,        // 0-based index of correct answer
 *   exp: "Explanation why this answer is correct",
 *   difficulty: "easy" | "medium" | "hard",
 *   tags: ["tag1", "tag2"],
 *   exam: "MPSC",
 *   subject: "History",
 * }
 * ================================================================
 */
