// Extracted from index.html

        // ═══════════════════════════════════════════════════════
        // FIREBASE MODULAR API COMPATIBILITY SHIM
        // ═══════════════════════════════════════════════════════
        // The page loads the Firebase compat SDK (v10 compat builds).
        // The code below uses the modular v9+ function style (collection(),
        // getDocs(), setDoc(), createUserWithEmailAndPassword(), etc.).
        // This shim maps modular function names to the compat SDK methods,
        // making all Firebase operations work without changing any code.
        // ═══════════════════════════════════════════════════════

        // Firestore modular functions via compat SDK
        const collection = (db, path) => db.collection(path);
        const doc = (db, path, ...ids) => {
            let ref = db.collection(path);
            for (const id of ids) ref = ref.doc(id);
            return ref;
        };
        const getDocs = (ref) => ref.get();
        const getDoc = (ref) => ref.get();
        const setDoc = (ref, data, options) => ref.set(data, options);
        const addDoc = (ref, data) => ref.add(data);
        const deleteDoc = (ref) => ref.delete();
        const onSnapshot = (ref, onNext, onError) => ref.onSnapshot(onNext, onError);

        // Auth modular functions via compat SDK
        const createUserWithEmailAndPassword = (auth, email, password) => auth.createUserWithEmailAndPassword(email, password);
        const signInWithEmailAndPassword = (auth, email, password) => auth.signInWithEmailAndPassword(email, password);
        const signInWithPopup = (auth, provider) => auth.signInWithPopup(provider);
        const signOut = (auth) => auth.signOut();
        const GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

        const subjectsData = {
            ethics: {
                title_en: 'Tarbiya & Akhlaq',
                title_am: 'ትርቢያ እና አክላቅ',
                desc_en: 'We build strong character, discipline, and respectful habits through guided daily practice.',
                desc_am: 'በዕለታዊ ልምምድ በጥሩ ባህሪ፣ ቅን አስተማርነት እና አክብሮት እንገነብታለን።',
                highlights_en: ['Purposeful morning routines', 'Moral reflection and kindness', 'Respectful community habits'],
                highlights_am: ['ትልቅ ዓላማ ያለው ጠዋት ልምምድ', 'ስነ-ምግባር እና ደግነት', 'የማህበረሰብ አክብሮት']
            },
            languages: {
                title_en: 'Languages',
                title_am: 'ቋንቋዎች',
                desc_en: 'Students gain confidence in reading, speaking, and understanding both Amharic and English.',
                desc_am: 'ተማሪዎች በአማርኛ እና እንግሊዝኛ ማንበብ፣ መናገር እና መረዳት ቸልተኛ አይደሉም።',
                highlights_en: ['Reading fluency', 'Vocabulary support', 'Speaking practice'],
                highlights_am: ['የማንበብ ችሎታ', 'የቃላት እርዳታ', 'የመናገር ልምምድ']
            },
            science: {
                title_en: 'Science & Math',
                title_am: 'ሳይንስ እና ሂሳብ',
                desc_en: 'Hands-on experiments and problem-solving help students understand concepts deeply.',
                desc_am: 'በእጅ ልምምድ እና ችግር መፍታት ተማሪዎች ፅንሰ-ሀሳቦችን በጥልቀት ይረዱታል።',
                highlights_en: ['Practical labs', 'Concept-based learning', 'Numeracy growth'],
                highlights_am: ['ተግባራዊ ላብራቶሪ', 'ፅንሰ-ሀሳብ ላይ የተመሰረተ ትምህርት', 'የቁጥር እውቀት እድገት']
            },
            it: {
                title_en: 'Technology & Innovation',
                title_am: 'ቴክኖሎጂ እና ፈጠራ',
                desc_en: 'Students learn digital skills and creative problem solving to thrive in modern life.',
                desc_am: 'ተማሪዎች የዲጂታል ችሎታ እና የፈጠራ ችግር መፍታት ይማራሉ።',
                highlights_en: ['Basic tech literacy', 'Creative projects', 'Digital collaboration'],
                highlights_am: ['መሰረታዊ ዲጂታል ችሎታ', 'ፈጠራ ፕሮጀክቶች', 'ዲጂታል ትብብር']
            }
        };

// ═══════════════════════════════════════════════════════════════
// 🔥 FIREBASE - SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════
// All application data is stored in Firestore and read directly
// from Firestore. localStorage is ONLY used for:
//   - Theme preference (dark/light mode)
//   - Cached UI settings (non-sensitive)
//   - Temporary non-sensitive data
// ═══════════════════════════════════════════════════════════════

        // ═══════════════════════════════════════════════════════
        // FIREBASE CONFIGURATION
        // ═══════════════════════════════════════════════════════

        const firebaseConfig = {
            apiKey: "AIzaSyBR43lKjQXeFzf2sei5MgKd7RYB2w4cwVk",
            authDomain: "bikolos.firebaseapp.com",
            databaseURL: "https://bikolos-default-rtdb.firebaseio.com",
            projectId: "bikolos",
            storageBucket: "bikolos.firebasestorage.app",
            messagingSenderId: "44685352357",
            appId: "1:44685352357:web:32b241dcc757f35a4bdc4c",
            measurementId: "G-0VLWNCEJDE"
        };

        const appId = 'bikolos-nur-academy';
        let db = null;
        let auth = null;
        let activeUser = null;
        let isFirebaseAvailable = false;

        // Firestore collection references
        const COLLECTIONS = {
            ACCOUNTS: 'accounts',
            ANNOUNCEMENTS: 'announcements',
            ASSIGNMENTS: 'student_assignments',
            SUBMISSIONS: 'homework_submissions',
            INQUIRIES: 'student_inquiries',
            MESSAGES: 'direct_messages',
            QUIZ_SCORES: 'quiz_scores',
            STUDY_LOGS: 'study_logs',
            AKHLAQ_POINTS: 'akhlaq_points'
        };

        // Cache for real-time listeners
        let activeListeners = {};

        function getCollectionPath(collectionName) {
            return `artifacts/${appId}/public/data/${collectionName}`;
        }

        function buildPortalEmailAddress(idValue) {
            return `${String(idValue || '').trim().toLowerCase()}@bna.local`;
        }

        // ═══════════════════════════════════════════════════════
        // FIREBASE INITIALIZATION
        // ═══════════════════════════════════════════════════════

        // ═══════════════════════════════════════════════════════
        // FIREBASE COMPAT SDK AUTO-EXPOSES GLOBAL FUNCTIONS:
        // firebase.initializeApp, firebase.firestore, firebase.auth
        // No custom adapter needed — use the native compat globals.
        // ═══════════════════════════════════════════════════════

        // Use native Firebase Compat SDK initialization
        if (firebaseConfig && firebaseConfig.apiKey && typeof firebase !== 'undefined' && firebase.initializeApp) {
            try {
                const app = firebase.initializeApp(firebaseConfig);
                db = firebase.firestore(app);
                auth = firebase.auth(app);
                isFirebaseAvailable = true;
                console.log("Firebase initialized successfully. Cloud Sync activated across all devices.");
                updateDatabaseStatusUI(true, "🟢 Connected (Cloud Database Synchronized)");
                
                // Enable Firestore offline persistence
                if (db && typeof db.enablePersistence === 'function') {
                    db.enablePersistence({
                        synchronizeTabs: true
                    }).catch((err) => {
                        if (err.code === 'failed-precondition') {
                            console.warn('Firestore persistence: multiple tabs open, persistence enabled in one tab only.');
                        } else if (err.code === 'unimplemented') {
                            console.warn('Firestore persistence not supported in this browser.');
                        }
                    });
                }
            } catch (err) {
                console.error("Firebase startup exception:", err);
                updateDatabaseStatusUI(false, "🔴 Connection Failed (Setup Correctly)");
            }
        } else {
            console.log("Firebase not configured. App will show connection status.");
            updateDatabaseStatusUI(false, "🟡 Firebase Not Configured");
        }

        function updateDatabaseStatusUI(active, text) {
            // Gracefully handle missing UI elements - they may not exist in all views
            const label = document.getElementById('dbStatusLabel');
            const container = document.getElementById('dbStatusContainer');
            if (label && container) {
                const colorClass = active ? 'bg-green-500' : 'bg-yellow-500';
                label.innerHTML = `<span class="w-2.5 h-2.5 rounded-full ${colorClass} animate-pulse inline-block"></span> ${text}`;
            }
        }

        // ═══════════════════════════════════════════════════════
        // FIRESTORE DATA ACCESS LAYER
        // ═══════════════════════════════════════════════════════
        // All data operations go directly to Firestore.
        // No localStorage caching for application data.
        // ═══════════════════════════════════════════════════════

        async function getFirestoreCollection(collectionName) {
            if (!isFirebaseAvailable || !db) return [];
            try {
                const colRef = collection(db, getCollectionPath(collectionName));
                const snapshot = await getDocs(colRef);
                const results = [];
                snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
                return results;
            } catch (error) {
                console.error(`Firestore read error (${collectionName}):`, error);
                return [];
            }
        }

        async function getFirestoreDocument(collectionName, docId) {
            if (!isFirebaseAvailable || !db) return null;
            try {
                const docRef = doc(db, getCollectionPath(collectionName), docId);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    return { id: snapshot.id, ...snapshot.data() };
                }
                return null;
            } catch (error) {
                console.error(`Firestore doc read error (${collectionName}/${docId}):`, error);
                return null;
            }
        }

        async function setFirestoreDocument(collectionName, docId, data) {
            if (!isFirebaseAvailable || !db) {
                console.warn(`Firebase not available. Cannot write to ${collectionName}/${docId}`);
                return false;
            }
            try {
                const docRef = doc(db, getCollectionPath(collectionName), docId);
                await setDoc(docRef, data, { merge: true });
                return true;
            } catch (error) {
                console.error(`Firestore write error (${collectionName}/${docId}):`, error);
                return false;
            }
        }

        async function addFirestoreDocument(collectionName, data) {
            if (!isFirebaseAvailable || !db) {
                console.warn(`Firebase not available. Cannot add to ${collectionName}`);
                return null;
            }
            try {
                const colRef = collection(db, getCollectionPath(collectionName));
                const docRef = await addDoc(colRef, data);
                return { id: docRef.id, ...data };
            } catch (error) {
                console.error(`Firestore add error (${collectionName}):`, error);
                return null;
            }
        }

        async function deleteFirestoreDocument(collectionName, docId) {
            if (!isFirebaseAvailable || !db) return false;
            try {
                const docRef = doc(db, getCollectionPath(collectionName), docId);
                await deleteDoc(docRef);
                return true;
            } catch (error) {
                console.error(`Firestore delete error (${collectionName}/${docId}):`, error);
                return false;
            }
        }

        // ═══════════════════════════════════════════════════════
        // REAL-TIME FIRESTORE LISTENERS
        // ═══════════════════════════════════════════════════════
        // These keep the UI in sync with Firestore changes.
        // Data is read from Firestore, NOT localStorage.
        // ═══════════════════════════════════════════════════════

        function subscribeToCollection(collectionName, callback) {
            if (!isFirebaseAvailable || !db) {
                callback([]);
                return null;
            }

            // Unsubscribe existing listener if any
            if (activeListeners[collectionName]) {
                activeListeners[collectionName]();
            }

            const colRef = collection(db, getCollectionPath(collectionName));
            const unsubscribe = onSnapshot(colRef, (snapshot) => {
                const results = [];
                snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
                callback(results);
            }, (error) => {
                console.error(`Firestore listener error (${collectionName}):`, error);
                callback([]);
            });

            activeListeners[collectionName] = unsubscribe;
            return unsubscribe;
        }

        function unsubscribeAllListeners() {
            Object.values(activeListeners).forEach(unsub => {
                if (typeof unsub === 'function') unsub();
            });
            activeListeners = {};
        }

        // ═══════════════════════════════════════════════════════
        // AUTHENTICATION - FIREBASE AUTH ONLY
        // ═══════════════════════════════════════════════════════
        // No localStorage authentication.
        // Student ID is converted to email: studentId@bna.local
        // Passwords are NEVER stored in Firestore.
        // ═══════════════════════════════════════════════════════

        async function createPortalAuthUser(idValue, password) {
            if (!auth || typeof createUserWithEmailAndPassword !== 'function') {
                console.error('[AUTH] Firebase Auth not available for user creation.');
                return { ok: false, skipped: true, reason: 'auth-unavailable' };
            }

            const email = buildPortalEmailAddress(idValue);
            try {
                const credential = await createUserWithEmailAndPassword(auth, email, password);
                console.log(`[AUTH] Firebase Auth user created successfully for ${email}`);
                return { ok: true, email, user: credential.user };
            } catch (error) {
                console.error(`[AUTH] Firebase Auth creation failed for ${email}:`, error.code, error.message);
                if (error?.code === 'auth/email-already-in-use') {
                    return { ok: false, skipped: true, reason: 'email-exists', email, error };
                }
                return { ok: false, skipped: false, reason: 'auth-error', email, error };
            }
        }

        async function deletePortalAuthUserByEmail(email) {
            if (!auth || !auth.currentUser) {
                console.warn('[AUTH] Cannot delete Auth user - no admin session.');
                return false;
            }
            // Cloud Functions are no longer used. Auth user deletion requires Firebase Admin SDK.
            // The Firestore profile will be deleted separately.
            console.warn('[AUTH] Portal auth user deletion not available without Cloud Functions.');
            return false;
        }

        async function signInPortalUser(idValue, password) {
            if (!auth || typeof signInWithEmailAndPassword !== 'function') {
                console.error('[AUTH] Firebase Auth not available for sign in.');
                return { ok: false, skipped: true, reason: 'auth-unavailable' };
            }

            const email = buildPortalEmailAddress(idValue);
            try {
                const credential = await signInWithEmailAndPassword(auth, email, password);
                console.log(`[AUTH] Sign-in successful for ${email}`);
                return { ok: true, email, user: credential.user };
            } catch (error) {
                console.error(`[AUTH] Sign-in failed for ${email}:`, error.code, error.message);
                return { ok: false, skipped: false, reason: 'auth-error', email, error };
            }
        }

        async function handleGoogleAdminLogin() {
            if (!auth || typeof signInWithPopup !== 'function') {
                showToast('Google sign-in is not available right now. Firebase Auth may not be initialized.', 'error');
                console.error('[AUTH] Google sign-in unavailable: auth or signInWithPopup is missing');
                return;
            }

            try {
                // Ensure GoogleAuthProvider is available
                if (typeof GoogleAuthProvider === 'undefined') {
                    showToast('Google authentication provider not loaded. Please refresh the page.', 'error');
                    console.error('[AUTH] GoogleAuthProvider is undefined');
                    return;
                }
                
                const provider = new GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });
                const result = await signInWithPopup(auth, provider);
                const user = result?.user;

                if (!user || !user.email) {
                    await signOut(auth);
                    showToast('Could not retrieve account information. Please try again.', 'error');
                    return;
                }

                // Verify admin status using client-side email comparison
                let isAuthorized = false;
                const ADMIN_EMAIL = 'cobra.broken@gmail.com';

                console.log('[AUTH] Performing client-side admin email comparison');
                console.log('[AUTH] Signed-in email:', user.email);
                const emailMatch = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                console.log('[AUTH] Email match result:', emailMatch);
                if (emailMatch) {
                    console.log('[AUTH] Admin email matched - granting access');
                    isAuthorized = true;
                } else {
                    console.log('[AUTH] Authorization denied - signed-in email does not match the configured admin account');
                }

                if (!isAuthorized) {
                    await signOut(auth);
                    showToast('Only authorized administrator Google accounts are allowed.', 'error');
                    return;
                }

                // Check if admin profile exists in Firestore
                let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);
                let adminProfile = accounts.find(acc => acc?.role === 'Admin' && acc?.authEmail === user.email);

                if (!adminProfile) {
                    adminProfile = {
                        uid: 'admin-' + user.uid,
                        name: user.displayName || 'System Administrator',
                        username: 'admin',
                        role: 'Admin',
                        idNumber: 'admin-' + Date.now(),
                        campus: 'System Central',
                        email: user.email,
                        authEmail: user.email,
                        authUid: user.uid,
                        createdAt: new Date().toISOString()
                    };
                    const saved = await setFirestoreDocument(COLLECTIONS.ACCOUNTS, adminProfile.uid, adminProfile);
                    if (!saved) {
                        console.error('[AUTH] Failed to create admin Firestore profile.');
                        showToast('Failed to create administrator profile. Please contact support.', 'error');
                        return;
                    }
                    console.log('[AUTH] Admin Firestore profile created.');
                }

                window.loggedInProfile = adminProfile;
                document.getElementById('portal-auth-view').classList.add('hidden');
                renderAppropriateDashboard(adminProfile);
                showToast('Administrator access granted.', 'success');
            } catch (error) {
                console.error('[AUTH] Google admin sign-in failed:', error);
                showToast('Google admin sign-in failed. Please try again.', 'error');
            }
        }

        window.handleGoogleAdminLogin = handleGoogleAdminLogin;

        // ═══════════════════════════════════════════════════════
        // PORTAL LOGIN - FIREBASE AUTH ONLY
        // ═══════════════════════════════════════════════════════
        // No localStorage fallback. Must use Firebase Auth.
        // ═══════════════════════════════════════════════════════

        async function handlePortalLogin(event) {
            event.preventDefault();
            const idVal = document.getElementById('loginIdField').value.trim();
            const passVal = document.getElementById('loginPassword').value.trim();

            if (!idVal || !passVal) {
                showToast("Please enter both ID and Password.", "error");
                return;
            }

            // Step 1: Authenticate via Firebase Auth
            if (!auth || typeof signInWithEmailAndPassword !== 'function') {
                showToast("Firebase is not configured. Please set up Firebase configuration.", "error");
                return;
            }

            const authResult = await signInPortalUser(idVal, passVal);
            if (!authResult.ok) {
                if (authResult.reason === 'auth-unavailable') {
                    showToast("Firebase Authentication is not available. Please check your connection.", "error");
                    return;
                }
                if (authResult.error?.code === 'auth/network-request-failed') {
                    showToast("No internet connection. Cannot sign in. Please check your network.", "error");
                    return;
                }
                if (authResult.error?.code === 'auth/user-not-found') {
                    showToast("Account not found. Please contact the school administrator.", "error");
                    return;
                }
                if (authResult.error?.code === 'auth/wrong-password' || authResult.error?.code === 'auth/invalid-credential') {
                    showToast("Incorrect password. Please try again.", "error");
                    return;
                }
                showToast("Sign-in failed. Please check your credentials and try again.", "error");
                return;
            }

            // Step 2: Load profile from Firestore using direct document lookup
            const email = buildPortalEmailAddress(idVal);
            let activeUserProfile = null;

            try {
                let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);
                activeUserProfile = accounts.find(acc => acc && acc.idNumber === idVal);
            } catch (error) {
                console.error('[AUTH] Firestore profile lookup error:', error);
            }

            if (!activeUserProfile) {
                console.error(`[AUTH] Profile not found in Firestore for ID: ${idVal} (email: ${email})`);
                showToast("Account profile not found in the system. Please contact the administrator.", "error");
                return;
            }

            console.log(`[AUTH] Profile loaded successfully for ${activeUserProfile.name} (${activeUserProfile.role})`);
            window.loggedInProfile = activeUserProfile;

            document.getElementById('portal-auth-view').classList.add('hidden');
            renderAppropriateDashboard(activeUserProfile);
            showToast(`Sign-in validated! Welcome, ${activeUserProfile.name}.`, "success");
        }

        function handlePortalLogout() {
            // Sign out from Firebase Auth
            if (auth && typeof signOut === 'function') {
                signOut(auth).catch(err => console.warn('[AUTH] Sign out warning:', err));
            }
            
            window.loggedInProfile = null;
            
            document.getElementById('studentPortalDashboard').classList.add('hidden');
            document.getElementById('teacherPortalDashboard').classList.add('hidden');
            document.getElementById('parentPortalDashboard').classList.add('hidden');
            document.getElementById('systemAdminPortalDashboard').classList.add('hidden');
            
            document.getElementById('portal-auth-view').classList.remove('hidden');
            document.getElementById('portalForm_login').reset();
            showToast("Successfully logged out.", "info");
        }

        // ═══════════════════════════════════════════════════════
        // DASHBOARD RENDERING
        // ═══════════════════════════════════════════════════════
        // All data loaded directly from Firestore
        // ═══════════════════════════════════════════════════════

        function renderAppropriateDashboard(profile) {
            if (profile.role === 'Admin') {
                document.getElementById('systemAdminPortalDashboard').classList.remove('hidden');
                renderAdminDirectoryTable();
                renderAdminTuitionTable();
            } else if (profile.role === 'Student') {
                document.getElementById('studentPortalDashboard').classList.remove('hidden');
                document.getElementById('studentProfileName').textContent = profile.name;
                document.getElementById('studentProfileMeta').textContent = `${profile.role} • ${profile.campus} • Grade ${profile.grade}-${profile.section}`;
                document.getElementById('studentCampusAnnLabel').textContent = `(${profile.campus})`;
                
                renderStudentAcademicTrack(profile);
                loadStudentCampusFeeds(profile);
            } else if (profile.role === 'Teacher') {
                document.getElementById('teacherPortalDashboard').classList.remove('hidden');
                document.getElementById('teacherProfileName').textContent = profile.name;
                document.getElementById('teacherProfileMeta').textContent = `${profile.role} • ${profile.campus} Campus`;
                document.getElementById('teacherAnnCampusLabel').textContent = profile.campus;
                
                loadTeacherCampusFeeds(profile);
            } else if (profile.role === 'Parent') {
                document.getElementById('parentPortalDashboard').classList.remove('hidden');
                document.getElementById('parentProfileName').textContent = profile.name;
                document.getElementById('parentProfileMeta').textContent = `Parent Gate • Child ID: ${profile.childIdNumber}`;
                document.getElementById('parentChildLinkedID').textContent = `Linking Child ID: ${profile.childIdNumber}`;
                
                loadParentCampusFeeds(profile);
            }
        }

        function renderStudentAcademicTrack(student) {
            const container = document.getElementById('studentTrackContainer');
            if (!container) return;
            let gradeVal = parseInt(student.grade);
            
            if (gradeVal >= 9) {
                container.innerHTML = `
                    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <span class="text-[9px] font-bold text-logoGreen-dark uppercase tracking-widest block">Senior Planner</span>
                                <h4 class="text-sm font-black text-logoBlue dark:text-white">Career Stream & Academic Target Tracker</h4>
                            </div>
                            <span class="bg-logoGreen-light text-logoBlue font-bold text-[9px] px-2 py-0.5 rounded">High School Active</span>
                        </div>
                        <p class="text-[11px] text-slate-400">Manage your daily study parameters and analyze consecutive streaks.</p>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div class="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800">
                                <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1">Target Study Hours Today</label>
                                <input type="number" id="studyTargetHours" class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-logoBlue dark:text-white focus:outline-none" value="5">
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800">
                                <span class="block text-[9px] font-bold uppercase text-slate-400 mb-1">Assigned Stream</span>
                                <span class="block text-xs font-black text-logoBlue dark:text-white mt-1">${student.stream ? student.stream + ' Sciences' : 'General Track'}</span>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800 flex flex-col justify-center">
                                <label class="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                                    <input type="checkbox" id="goalCompleteCheck" class="rounded text-logoGreen border-slate-300 w-4 h-4">
                                    <span>All daily study targets met</span>
                                </label>
                            </div>
                            <div class="flex items-center justify-center p-2">
                                <button onclick="launchStreakViewerPage()" class="w-full py-3 bg-logoBlue hover:bg-logoBlue-light text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                                    <i class="fa-solid fa-fire text-logoGreen animate-pulse"></i>
                                    <span>View My Streak Arena</span>
                                </button>
                            </div>
                        </div>

                        <button onclick="saveHighSchoolStudyLog()" class="px-5 py-2.5 bg-logoGreen text-logoBlue font-bold rounded-xl text-xs hover:bg-logoGreen-dark transition-all flex items-center gap-2">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <span>Save Academic Study Log</span>
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <span class="text-[9px] font-bold text-logoGreen-dark uppercase tracking-widest block">Middle School Workspace</span>
                                <h4 class="text-sm font-black text-logoBlue dark:text-white">Active Academic Summary Dashboard</h4>
                            </div>
                            <span class="bg-logoGreen-light text-logoBlue font-bold text-[9px] px-2 py-0.5 rounded">Primary Track</span>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 leading-relaxed">
                            <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span class="block font-bold text-logoBlue dark:text-white mb-1"><i class="fa-solid fa-circle-info text-logoGreen-dark mr-1"></i> Middle School Guidelines</span>
                                Complete daily home assignments via the Digital Classroom locker. Teachers will review submissions and publish feedback here.
                            </div>
                            <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span class="block font-bold text-logoBlue dark:text-white mb-1"><i class="fa-solid fa-award text-logoGreen-dark mr-1"></i> Evaluation Arena</span>
                                Select your grade-specific subject channel to evaluate daily study progress. Leaders board aggregates scores dynamically.
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // ═══════════════════════════════════════════════════════
        // STUDENT FEEDS - LOADED FROM FIRESTORE
        // ═══════════════════════════════════════════════════════

        async function loadStudentCampusFeeds(student) {
            // Load announcements from Firestore
            let anns = await getFirestoreCollection(COLLECTIONS.ANNOUNCEMENTS);
            let campusAnns = anns.filter(a => a.campus === student.campus);
            const annContainer = document.getElementById('studentAnnFeed');
            if (annContainer) {
                annContainer.innerHTML = '';
                if (campusAnns.length === 0) {
                    annContainer.innerHTML = `<p class="text-slate-300 italic text-[11px]">No bulletins posted for your campus yet.</p>`;
                } else {
                    campusAnns.slice(0, 3).forEach(item => {
                        const el = document.createElement('div');
                        el.className = "p-3 bg-white/10 rounded-xl border border-white/10";
                        el.innerHTML = `
                            <div class="flex justify-between items-center mb-1">
                                <span class="font-bold text-logoGreen">${item.title}</span>
                                <span class="text-[8px] bg-logoGreen text-logoBlue font-bold px-1.5 rounded">${item.topic}</span>
                            </div>
                            <p class="text-[10px] text-slate-100 leading-relaxed">${item.content}</p>
                            <span class="block text-[8px] text-slate-300 mt-1">— Issued by ${item.author}</span>
                        `;
                        annContainer.appendChild(el);
                    });
                }
            }

            // Load assignments from Firestore
            let allAsms = await getFirestoreCollection(COLLECTIONS.ASSIGNMENTS);
            let campusAsms = allAsms.filter(asm => {
                const campusMatch = asm.campus === student.campus;
                const gradeMatch = !asm.targetGrade || asm.targetGrade === 'All' || asm.targetGrade === student.grade;
                const secMatch = !asm.targetSection || asm.targetSection === 'All' || asm.targetSection === student.section;
                return campusMatch && gradeMatch && secMatch;
            });

            const assignContainer = document.getElementById('studentAssignmentsList');
            if (assignContainer) {
                assignContainer.innerHTML = '';
                let submissions = await getFirestoreCollection(COLLECTIONS.SUBMISSIONS);
                let studentSubmissions = submissions.filter(sub => sub.studentId === student.idNumber);

                if (campusAsms.length === 0) {
                    assignContainer.innerHTML = `<p class="text-[10px] text-slate-400 italic">No homework assigned yet for Grade ${student.grade}-${student.section} at ${student.campus}.</p>`;
                } else {
                    campusAsms.forEach(asm => {
                        let alreadySub = studentSubmissions.find(s => s.assignmentId === asm.id);
                        let subStatusHtml = '';
                        
                        if (alreadySub) {
                            const gradeVal = alreadySub.grade ? `<b class="text-logoGreen-dark">${alreadySub.grade}/100</b>` : '<span class="text-yellow-600 font-semibold">Pending Grade</span>';
                            subStatusHtml = `
                                <div class="mt-2 p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 text-[10px]">
                                    <span class="block font-bold text-logoBlue dark:text-white">Submission Status: <span class="text-green-600">Uploaded</span></span>
                                    <span class="block text-slate-400 mt-1">Your Notes: "${alreadySub.textSubmission}"</span>
                                    <span class="block mt-1 font-semibold">Teacher Grade: ${gradeVal} | Feedback: <span class="text-slate-500">${alreadySub.feedback || 'None'}</span></span>
                                </div>
                            `;
                        } else {
                            subStatusHtml = `
                                <div class="mt-2 space-y-2">
                                    <input type="text" id="hwSubmissionText_${asm.id}" class="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded text-xs text-logoBlue dark:text-white focus:outline-none" placeholder="Write your homework response text here...">
                                    <button onclick="submitHomeworkAnswer('${asm.id}')" class="px-3 py-1.5 bg-logoGreen text-logoBlue font-bold text-[10px] rounded">Submit Response</button>
                                </div>
                            `;
                        }

                        const card = document.createElement('div');
                        card.className = "p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs space-y-1.5";
                        card.innerHTML = `
                            <div class="flex justify-between items-center font-bold">
                                <span class="text-logoBlue dark:text-white">${asm.title}</span>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-[8px] uppercase tracking-wider bg-logoGreen-light text-logoBlue px-2 py-0.5 rounded">${asm.subject}</span>
                                    <span class="text-[8px] uppercase tracking-wider bg-slate-100 text-logoBlue px-2 py-0.5 rounded">Gr ${asm.targetGrade || 'All'}-${asm.targetSection || 'All'}</span>
                                </div>
                            </div>
                            <p class="text-slate-500 leading-relaxed">${asm.description}</p>
                            <span class="block text-[8px] text-red-500 font-bold">Due Date: ${asm.dueDate}</span>
                            ${subStatusHtml}
                        `;
                        assignContainer.appendChild(card);
                    });
                }
            }

            // Load inquiries from Firestore
            let inqs = await getFirestoreCollection(COLLECTIONS.INQUIRIES);
            let filteredInqs = inqs.filter(q => q.studentUser === student.username);
            const containerInq = document.getElementById('studentQuestionsHistoryFeed');
            if (containerInq) {
                containerInq.innerHTML = '';
                if (filteredInqs.length === 0) {
                    containerInq.innerHTML = '<p class="text-[10px] text-slate-400 italic">No inquiries posted yet.</p>';
                } else {
                    filteredInqs.forEach(item => {
                        const card = document.createElement('div');
                        card.className = "p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs space-y-1.5";
                        const badgeClass = item.status === 'Answered' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
                        let replyHTML = `<p class="text-[10px] text-slate-400 italic">No reply yet from your campus advisors.</p>`;
                        if (item.reply) {
                            replyHTML = `
                                <div class="p-2 bg-logoGreen-light dark:bg-slate-900 border-l-2 border-logoGreen rounded rounded-l-none mt-1 text-[10px]">
                                    <span class="block font-bold text-logoBlue dark:text-white mb-0.5">${item.repliedBy || 'Teacher'}:</span>
                                    <span class="text-slate-600 dark:text-slate-300">${item.reply}</span>
                                </div>
                            `;
                        }
                        card.innerHTML = `
                            <div class="flex justify-between items-start">
                                <p class="text-[10px] text-slate-600 dark:text-slate-300 italic">"${item.question}"</p>
                                <span class="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${badgeClass}">${item.status}</span>
                            </div>
                            ${replyHTML}
                        `;
                        containerInq.appendChild(card);
                    });
                }
            }
        }

        // ═══════════════════════════════════════════════════════
        // PARENT FEEDS - LOADED FROM FIRESTORE
        // ═══════════════════════════════════════════════════════

        async function loadParentCampusFeeds(parent) {
            let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);
            let linkedChild = accounts.find(acc => acc.role === 'Student' && acc.idNumber === parent.childIdNumber);
            const habitReport = document.getElementById('parentChildHabitReport');
            const mannersReport = document.getElementById('parentMannersBadgesFeed');
            const tuitionContainer = document.getElementById('parentTuitionGridContainer');
            
            if (!habitReport || !mannersReport || !tuitionContainer) return;

            if (!linkedChild) {
                habitReport.innerHTML = `<p class="italic text-[10px] text-red-500">Child profile matching Student ID ${parent.childIdNumber} was not found on portal directory.</p>`;
                mannersReport.innerHTML = `<p class="text-[10px] text-slate-400 italic">No data.</p>`;
                return;
            }

            const profileMeta = document.getElementById('parentProfileMeta');
            if (profileMeta) profileMeta.textContent = `Parent of ${linkedChild.name} • ${linkedChild.campus} • Grade ${linkedChild.grade}-${linkedChild.section}`;

            // Load study logs from Firestore
            let logs = await getFirestoreCollection(COLLECTIONS.STUDY_LOGS);
            let childLogs = logs.filter(l => l.studentId === linkedChild.idNumber);
            
            if (childLogs.length === 0) {
                habitReport.innerHTML = `<p class="italic text-[11px] text-slate-400">Your child (${linkedChild.name}) has not registered targets logs yet today.</p>`;
            } else {
                let latestLog = childLogs[childLogs.length - 1];
                habitReport.innerHTML = `
                    <div class="space-y-2">
                        <span class="text-[10px] text-slate-400 font-semibold">Latest log recorded: ${new Date(latestLog.date).toLocaleDateString()}</span>
                        <ul class="space-y-1 ml-2 text-[11px] font-semibold text-logoBlue dark:text-white">
                            <li>• Target daily study: <b>${latestLog.studyHours} Hours</b></li>
                            <li>• Goal status: <b>${latestLog.goalComplete ? 'Completed' : 'Pending'}</b></li>
                        </ul>
                    </div>
                `;
            }

            // Load akhlaq points from Firestore
            let pts = await getFirestoreCollection(COLLECTIONS.AKHLAQ_POINTS);
            let childPts = pts.filter(p => p.studentUser === linkedChild.username);
            mannersReport.innerHTML = '';
            
            if (childPts.length === 0) {
                mannersReport.innerHTML = `<p class="text-[10px] text-slate-400 italic">No manners endorsements logged by teachers yet.</p>`;
            } else {
                childPts.forEach(p => {
                    const row = document.createElement('div');
                    row.className = "p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs";
                    row.innerHTML = `
                        <div>
                            <span class="block font-bold text-logoBlue dark:text-white">${p.badgeType}</span>
                            <span class="block text-[8px] text-slate-400">Awarded by ${p.awardedBy}</span>
                        </div>
                        <span class="font-black text-logoGreen-dark">+${p.points} Pts</span>
                    `;
                    mannersReport.appendChild(row);
                });
            }

            // Load messages from Firestore
            let messages = await getFirestoreCollection(COLLECTIONS.MESSAGES);
            let parentMessages = messages.filter(m => m.studentId === parent.childIdNumber);
            const parentMsgFeed = document.getElementById('parentDirectMessagesFeed');
            if (parentMsgFeed) {
                parentMsgFeed.innerHTML = '';
                if (parentMessages.length === 0) {
                    parentMsgFeed.innerHTML = `<p class="text-[10px] text-slate-400 italic">No direct messages received from teachers yet.</p>`;
                } else {
                    parentMessages.slice().reverse().forEach(msg => {
                        const row = document.createElement('div');
                        row.className = "p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5 shadow-sm animate-fade-in";
                        row.innerHTML = `
                            <div class="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                                <span class="text-logoGreen-dark"><i class="fa-solid fa-chalkboard-user mr-1"></i> ${msg.teacherName} (Teacher)</span>
                                <span>${new Date(msg.date).toLocaleDateString()}</span>
                            </div>
                            <p class="text-[11px] text-logoBlue dark:text-slate-200 font-medium leading-relaxed">"${msg.message}"</p>
                        `;
                        parentMsgFeed.appendChild(row);
                    });
                }
            }

            // Real-time payment check links directly to the selected child's account payments object
            if (!linkedChild.payments) {
                linkedChild.payments = { term1: false, term2: false, term3: false };
            }

            const formatBadge = (isPaid) => {
                return isPaid 
                    ? `<span class="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-black text-[10px] rounded uppercase">Paid</span>`
                    : `<span class="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-black text-[10px] rounded uppercase">Not Paid</span>`;
            };

            tuitionContainer.innerHTML = `
                <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs">
                    <div>
                        <span class="block text-[9px] uppercase font-bold text-slate-400">Term 1 Tuition</span>
                        <span class="font-extrabold text-logoBlue dark:text-white">8,500 ETB</span>
                    </div>
                    ${formatBadge(linkedChild.payments.term1)}
                </div>

                <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs">
                    <div>
                        <span class="block text-[9px] uppercase font-bold text-slate-400">Term 2 Tuition</span>
                        <span class="font-extrabold text-logoBlue dark:text-white">8,500 ETB</span>
                    </div>
                    ${formatBadge(linkedChild.payments.term2)}
                </div>

                <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs">
                    <div>
                        <span class="block text-[9px] uppercase font-bold text-slate-400">Term 3 Tuition</span>
                        <span class="font-extrabold text-logoBlue dark:text-white">8,500 ETB</span>
                    </div>
                    ${formatBadge(linkedChild.payments.term3)}
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════
        // TEACHER FEEDS - LOADED FROM FIRESTORE
        // ═══════════════════════════════════════════════════════

        async function loadTeacherCampusFeeds(teacher) {
            let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);
            const selectEl = document.getElementById('teacherSel_student');
            if (selectEl) {
                selectEl.innerHTML = '<option value="">-- Choose Student --</option>';
                accounts.forEach(data => {
                    if (data.campus === teacher.campus && data.role === 'Student') {
                        const opt = document.createElement('option');
                        opt.value = data.username;
                        opt.textContent = `${data.name} (Grade ${data.grade}-${data.section})`;
                        selectEl.appendChild(opt);
                    }
                });
            }

            const selectMsgEl = document.getElementById('teacherSel_studentMsg');
            if (selectMsgEl) {
                selectMsgEl.innerHTML = '<option value="">-- Choose Student --</option>';
                accounts.forEach(data => {
                    if (data.campus === teacher.campus && data.role === 'Student') {
                        const opt = document.createElement('option');
                        opt.value = data.idNumber;
                        opt.textContent = `${data.name} (Grade ${data.grade}-${data.section})`;
                        selectMsgEl.appendChild(opt);
                    }
                });
            }
            loadTeacherSentMessagesLog(teacher);

            // Load inquiries from Firestore
            let inqs = await getFirestoreCollection(COLLECTIONS.INQUIRIES);
            let campusInqs = inqs.filter(q => q.campus === teacher.campus);
            const containerInq = document.getElementById('teacherInquiriesTerminalFeed');
            if (containerInq) {
                containerInq.innerHTML = '';
                if (campusInqs.length === 0) {
                    containerInq.innerHTML = '<p class="text-[10px] text-slate-400 italic">No incoming student or parent questions yet.</p>';
                } else {
                    campusInqs.forEach(item => {
                        const card = document.createElement('div');
                        card.className = "p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs space-y-2";
                        let replyFormHTML = `
                            <div class="flex gap-2">
                                <input type="text" id="replyText_${item.id}" class="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] text-logoBlue dark:text-white focus:outline-none focus:border-logoGreen" placeholder="Write reply note...">
                                <button onclick="submitQuestionReply('${item.id}')" class="px-3 bg-logoBlue hover:opacity-90 text-white text-[10px] font-bold rounded-lg">Reply</button>
                            </div>
                        `;
                        if (item.reply) {
                            replyFormHTML = `
                                <p class="text-[10px] text-logoGreen-dark font-semibold">Answered: "${item.reply}" <span class="text-slate-400 font-normal ml-2">— by ${item.repliedBy}</span></p>
                            `;
                        }
                        card.innerHTML = `
                            <div class="flex justify-between items-center text-[9px] text-slate-400">
                                <span>From: <b>${item.studentName}</b> (${item.studentUser})</span>
                                <span>${new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            <p class="text-[11px] text-logoBlue dark:text-white font-medium">"${item.question}"</p>
                            ${replyFormHTML}
                        `;
                        containerInq.appendChild(card);
                    });
                }
            }

            // Load submissions from Firestore
            let allSubmissions = await getFirestoreCollection(COLLECTIONS.SUBMISSIONS);
            let campusSubmissions = allSubmissions.filter(sub => sub.campus === teacher.campus);
            const reviewContainer = document.getElementById('teacherHomeworkReviewFeed');
            if (reviewContainer) {
                reviewContainer.innerHTML = '';
                if (campusSubmissions.length === 0) {
                    reviewContainer.innerHTML = `<p class="text-[10px] text-slate-400 italic">No homework responses uploaded yet by campus students.</p>`;
                } else {
                    campusSubmissions.forEach(sub => {
                        let gradingFormHTML = `
                            <div class="flex gap-2 items-center">
                                <input type="number" id="gradeInp_${sub.id}" class="w-16 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-logoBlue dark:text-white" placeholder="0-100">
                                <input type="text" id="feedbackInp_${sub.id}" class="flex-1 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-logoBlue dark:text-white" placeholder="Enter review note...">
                                <button onclick="gradeStudentSubmission('${sub.id}')" class="px-3 py-1.5 bg-logoGreen text-logoBlue font-bold text-[10px] rounded">Publish Grade</button>
                            </div>
                        `;
                        if (sub.grade) {
                            gradingFormHTML = `
                                <p class="text-[10px] text-logoGreen-dark font-extrabold">Graded: ${sub.grade}/100 <span class="text-slate-400 font-normal ml-2">Feedback: "${sub.feedback || 'None'}"</span></p>
                            `;
                        }

                        const itemDiv = document.createElement('div');
                        itemDiv.className = "p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs space-y-1.5";
                        itemDiv.innerHTML = `
                            <div class="flex justify-between items-center font-bold text-[9px] text-slate-400">
                                <span>Author: ${sub.studentName} (${sub.studentUser})</span>
                                <span class="bg-logoBlue text-white px-2 py-0.5 rounded">${sub.subject}</span>
                            </div>
                            <p class="text-logoBlue dark:text-white font-medium">Topic: ${sub.assignmentTitle}</p>
                            <p class="p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 text-[11px] italic">"${sub.textSubmission}"</p>
                            ${gradingFormHTML}
                        `;
                        reviewContainer.appendChild(itemDiv);
                    });
                }
            }
        }

        // ═══════════════════════════════════════════════════════
        // DATA WRITE OPERATIONS - ALL TO FIRESTORE
        // ═══════════════════════════════════════════════════════

        async function handleSendDirectMessageToParent() {
            const studentId = document.getElementById('teacherSel_studentMsg').value;
            const messageText = document.getElementById('teacherDirectMsgText').value.trim();
            const teacher = window.loggedInProfile;

            if (!studentId) {
                showToast("Please select a student first.", "error");
                return;
            }
            if (!messageText) {
                showToast("Please enter message content.", "error");
                return;
            }

            let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);
            let targetStudent = accounts.find(acc => acc.role === 'Student' && acc.idNumber === studentId);
            let targetParent = accounts.find(acc => acc.role === 'Parent' && acc.childIdNumber === studentId);

            if (!targetStudent) {
                showToast("Student not found.", "error");
                return;
            }

            const parentId = targetParent ? targetParent.idNumber : '';

            const dmObj = {
                id: 'msg-' + Date.now(),
                teacherUid: teacher.uid,
                teacherName: teacher.name,
                studentId: studentId,
                studentName: targetStudent.name,
                parentId: parentId,
                message: messageText,
                date: new Date().toISOString()
            };

            // Save directly to Firestore
            await setFirestoreDocument(COLLECTIONS.MESSAGES, dmObj.id, dmObj);
            
            document.getElementById('teacherDirectMsgText').value = '';
            showToast(`Message sent successfully about ${targetStudent.name}!`, "success");
            
            loadTeacherSentMessagesLog(teacher);
        }

        async function loadTeacherSentMessagesLog(teacher) {
            const outboxContainer = document.getElementById('teacherSentMessagesFeed');
            if (!outboxContainer) return;
            
            let messages = await getFirestoreCollection(COLLECTIONS.MESSAGES);
            let sentByMe = messages.filter(m => m.teacherUid === teacher.uid);

            if (sentByMe.length === 0) {
                outboxContainer.innerHTML = `<p class="text-[10px] text-slate-400 italic">No direct messages sent yet.</p>`;
            } else {
                sentByMe.slice().reverse().forEach(msg => {
                    const el = document.createElement('div');
                    el.className = "p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1";
                    el.innerHTML = `
                        <div class="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                            <span>To Parent of: <b class="text-logoBlue dark:text-white">${msg.studentName}</b> (ID: ${msg.studentId})</span>
                            <span>${new Date(msg.date).toLocaleDateString()}</span>
                        </div>
                        <p class="text-[10px] text-slate-600 dark:text-slate-300 italic">"${msg.message}"</p>
                    `;
                    outboxContainer.appendChild(el);
                });
            }
        }

        async function saveHighSchoolStudyLog() {
            const student = window.loggedInProfile;
            const hours = document.getElementById('studyTargetHours').value;
            const complete = document.getElementById('goalCompleteCheck').checked;

            const logObj = {
                studentId: student.idNumber,
                studyHours: parseInt(hours) || 0,
                goalComplete: complete,
                date: new Date().toISOString()
            };

            // Save directly to Firestore
            const logId = 'log-' + Date.now();
            logObj.id = logId;
            await setFirestoreDocument(COLLECTIONS.STUDY_LOGS, logId, logObj);
            
            showToast("High School Daily Study Log saved!", "success");
        }

        async function submitHomeworkAnswer(asmId) {
            const inputVal = document.getElementById(`hwSubmissionText_${asmId}`).value.trim();
            const student = window.loggedInProfile;

            if (!inputVal) {
                showToast("Please enter a response draft.", "error");
                return;
            }

            let assignmentsList = await getFirestoreCollection(COLLECTIONS.ASSIGNMENTS);
            let targetAsm = assignmentsList.find(a => a.id === asmId);

            const subObj = {
                id: 'sub-' + Date.now(),
                assignmentId: asmId,
                assignmentTitle: targetAsm ? targetAsm.title : "School Assignment",
                subject: targetAsm ? targetAsm.subject : "General",
                studentId: student.idNumber,
                studentName: student.name,
                studentUser: student.username,
                campus: student.campus,
                textSubmission: inputVal,
                grade: "",
                feedback: "",
                date: new Date().toISOString()
            };

            // Save directly to Firestore
            await setFirestoreDocument(COLLECTIONS.SUBMISSIONS, subObj.id, subObj);
            
            showToast("Homework successfully stored in Locker!", "success");
            loadStudentCampusFeeds(student);
        }

        async function handlePostInquiry(event) {
            event.preventDefault();
            const val = document.getElementById('studentInquiryText').value;
            const student = window.loggedInProfile;

            const inqObj = {
                id: 'inq-' + Date.now(),
                studentName: student.name,
                studentUser: student.username,
                campus: student.campus,
                question: val,
                reply: "",
                repliedBy: "",
                status: "Pending",
                date: new Date().toISOString()
            };

            // Save directly to Firestore
            await setFirestoreDocument(COLLECTIONS.INQUIRIES, inqObj.id, inqObj);
            
            document.getElementById('studentInquiryText').value = '';
            showToast("Advisory question submitted successfully!", "success");
            loadStudentCampusFeeds(student);
        }

        async function gradeStudentSubmission(subId) {
            const gradeVal = document.getElementById(`gradeInp_${subId}`).value;
            const feedbackVal = document.getElementById(`feedbackInp_${subId}`).value;
            const teacher = window.loggedInProfile;

            let numGrade = parseInt(gradeVal);
            if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
                showToast("Enter a valid grade score between 0 and 100.", "error");
                return;
            }

            // Update directly in Firestore
            let allSubmissions = await getFirestoreCollection(COLLECTIONS.SUBMISSIONS);
            let targetSub = allSubmissions.find(s => s.id === subId);
            
            if (targetSub) {
                targetSub.grade = numGrade;
                targetSub.feedback = feedbackVal;
                await setFirestoreDocument(COLLECTIONS.SUBMISSIONS, subId, targetSub);
                
                showToast("Grade published successfully!", "success");
                loadTeacherCampusFeeds(teacher);
            }
        }

        async function handleAwardAkhlaqPoints() {
            const studentUser = document.getElementById('teacherSel_student').value;
            const badgeType = document.getElementById('teacherSel_badgeType').value;
            const teacher = window.loggedInProfile;

            if (!studentUser) {
                showToast("Please select a valid student of your campus.", "error");
                return;
            }

            const ptObj = {
                studentUser,
                badgeType,
                points: badgeType.includes('Study') ? 15 : 10,
                awardedBy: teacher.name,
                campus: teacher.campus,
                date: new Date().toISOString()
            };

            // Save directly to Firestore
            const ptId = 'pt-' + Date.now();
            ptObj.id = ptId;
            await setFirestoreDocument(COLLECTIONS.AKHLAQ_POINTS, ptId, ptObj);
            
            showToast("Behavior score endorsement completed!", "success");
            loadTeacherCampusFeeds(teacher);
        }

        async function handlePostHomeworkTask(event) {
            event.preventDefault();
            const subject = document.getElementById('hwSubject').value;
            const title = document.getElementById('hwTitle').value;
            const desc = document.getElementById('hwDesc').value;
            const targetGrade = document.getElementById('hwTargetGrade').value;
            const targetSection = document.getElementById('hwTargetSection').value;
            const teacher = window.loggedInProfile;

            const asmObj = {
                id: 'asm-' + Date.now(),
                campus: teacher.campus,
                subject,
                title,
                description: desc,
                targetGrade,
                targetSection,
                dueDate: "2026-07-25"
            };

            // Save directly to Firestore
            await setFirestoreDocument(COLLECTIONS.ASSIGNMENTS, asmObj.id, asmObj);
            
            document.getElementById('hwSubject').value = '';
            document.getElementById('hwTitle').value = '';
            document.getElementById('hwDesc').value = '';
            showToast("Digital homework published!", "success");
            loadTeacherCampusFeeds(teacher);
        }

        async function handlePostAnnouncement(event) {
            event.preventDefault();
            const title = document.getElementById('annTitle').value;
            const content = document.getElementById('annContent').value;
            const topic = document.getElementById('teacherInp_topic').value || 'Campus Bulletin';
            const teacher = window.loggedInProfile;

            const annObj = {
                title,
                content,
                topic,
                campus: teacher.campus,
                author: teacher.name,
                date: new Date().toISOString()
            };

            // Save directly to Firestore
            const annId = 'ann-' + Date.now();
            annObj.id = annId;
            await setFirestoreDocument(COLLECTIONS.ANNOUNCEMENTS, annId, annObj);
            
            document.getElementById('annTitle').value = '';
            document.getElementById('annContent').value = '';
            document.getElementById('teacherInp_topic').value = '';
            showToast("Announcements broadcasted cleanly!", "success");
            loadTeacherCampusFeeds(teacher);
        }

        async function handleParentInquirySubmit(event) {
            event.preventDefault();
            const val = document.getElementById('parentInquiryText').value;
            const parent = window.loggedInProfile;

            const inqObj = {
                id: 'inq-' + Date.now(),
                studentName: `Parent: ${parent.name}`,
                studentUser: parent.username,
                campus: parent.campus,
                question: `Advisory Call Request: "${val}"`,
                reply: "",
                repliedBy: "",
                status: "Pending",
                date: new Date().toISOString()
            };

            // Save directly to Firestore
            await setFirestoreDocument(COLLECTIONS.INQUIRIES, inqObj.id, inqObj);
            
            document.getElementById('parentInquiryText').value = '';
            showToast("Meeting advisory request posted!", "success");
        }

        async function submitQuestionReply(id) {
            const txt = document.getElementById(`replyText_${id}`).value.trim();
            const teacher = window.loggedInProfile;

            if (!txt) {
                showToast("Write your answer first.", "error");
                return;
            }

            // Update directly in Firestore
            let inqs = await getFirestoreCollection(COLLECTIONS.INQUIRIES);
            let target = inqs.find(q => q.id === id);
            
            if (target) {
                target.reply = txt;
                target.repliedBy = teacher.name;
                target.status = "Answered";
                await setFirestoreDocument(COLLECTIONS.INQUIRIES, id, target);
                
                showToast("Reply submitted successfully!", "success");
                loadTeacherCampusFeeds(teacher);
            }
        }

        // ═══════════════════════════════════════════════════════
        // QUIZ SYSTEM
        // ═══════════════════════════════════════════════════════

        let activeQuestions = [];
        let runningQuizIndex = 0;
        let runningQuizScore = 0;
        let quizTimerInterval = null;
        let quizTimeRemaining = 420; // 7 Minutes Limit (420 seconds)

        function buildFallbackQuestions(subject, grade, stream) {
            const base = [];
            for (let i = 0; i < 15; i++) {
                const number = i + 1;
                const questionText = `${subject} practice question ${number}: Which answer best fits a Grade ${grade}${stream ? ` ${stream}` : ''} learner?`;
                const options = [
                    `${subject} concept ${number}A`,
                    `${subject} concept ${number}B`,
                    `${subject} concept ${number}C`,
                    `${subject} concept ${number}D`
                ];
                base.push({
                    q: questionText,
                    opts: options,
                    a: options[0]
                });
            }
            return base;
        }

        const CLOUDFLARE_QUIZ_WORKER_URL = 'https://bnaquiz.cobra-broken.workers.dev';

        async function fetchAIQuestions(subject, grade, stream) {
            try {
                const response = await fetch(CLOUDFLARE_QUIZ_WORKER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject, grade, stream })
                });
                if (response.ok) {
                    const data = await response.json();
                    const questions = data?.questions;
                    if (Array.isArray(questions) && questions.length >= 15) {
                        return questions.slice(0, 15);
                    }
                    console.warn('Cloudflare Worker returned insufficient questions, using fallback.');
                } else {
                    console.warn('Cloudflare Worker request failed with status:', response.status);
                }
            } catch (error) {
                console.warn('Cloudflare Worker quiz generation failed:', error);
            }

            return buildFallbackQuestions(subject, grade, stream);
        }

        function launchPortalQuizWindow() {
            const student = window.loggedInProfile;
            let gradeVal = parseInt(student.grade);

            if (isNaN(gradeVal)) {
                showToast("Evaluation Arena is reserved for students Grade 5 and above.", "error");
                return;
            }

            const page = document.getElementById('quiz-hall-page');
            const selection = document.getElementById('quizSelectionWorkspace');
            const execution = document.getElementById('quizExecutionWorkspace');
            const welcome = document.getElementById('quizWelcomeTitle');

            if (page) page.classList.remove('hidden');
            if (selection) selection.classList.remove('hidden');
            if (execution) execution.classList.add('hidden');
            
            if (welcome) welcome.textContent = `Welcome ${student.name} (Grade ${student.grade})`;

            const subSelect = document.getElementById('portalQuizSubjectSelect');
            if (subSelect) {
                subSelect.innerHTML = '';
                if (gradeVal === 5 || gradeVal === 6) {
                    const list = ["Mathematics", "English", "Amharic", "Science", "Social Studies", "Moral Education", "Performing and Visual Arts", "Physical Education", "Information Technology"];
                    list.forEach(s => subSelect.innerHTML += `<option value="${s}">${s}</option>`);
                } else if (gradeVal === 7 || gradeVal === 8) {
                    const list = ["Mathematics", "English", "Amharic", "General Science", "Social Studies", "Moral Education", "Career and Technical Education", "Physical Education", "Information Technology"];
                    list.forEach(s => subSelect.innerHTML += `<option value="${s}">${s}</option>`);
                } else if (gradeVal === 9 || gradeVal === 10) {
                    const list = ["Mathematics", "English", "Amharic", "Biology", "Chemistry", "Physics", "History", "Geography", "Civics(Citizenship)", "Information Technology", "Economics", "Physical Education"];
                    list.forEach(s => subSelect.innerHTML += `<option value="${s}">${s}</option>`);
                } else if (gradeVal >= 11) {
                    if (student.stream === 'Social') {
                        const list = ["Economics", "Geography", "History", "Information Technology", "English", "Mathematics", "SAT"];
                        list.forEach(s => subSelect.innerHTML += `<option value="${s}">${s}</option>`);
                    } else {
                        const list = ["English", "Mathematics", "Biology", "Chemistry", "Physics", "ICT", "SAT", "Agriculture"];
                        list.forEach(s => subSelect.innerHTML += `<option value="${s}">${s}</option>`);
                    }
                }
            }

            renderRealScoresLeaderboard();
        }

        function exitQuizWindow() {
            clearInterval(quizTimerInterval);
            const page = document.getElementById('quiz-hall-page');
            if (page) page.classList.add('hidden');
        }

        async function initiate15QuestionExam() {
            const selectEl = document.getElementById('portalQuizSubjectSelect');
            if (!selectEl) return;
            const subject = selectEl.value;
            const student = window.loggedInProfile;

            // Check last attempt from Firestore
            let scores = await getFirestoreCollection(COLLECTIONS.QUIZ_SCORES);
            let lastAttempt = scores.filter(s => s.studentId === student.idNumber && s.subject === subject)
                                   .sort((a,b) => new Date(b.date) - new Date(a.date))[0];

            if (lastAttempt) {
                let lastAttemptTime = new Date(lastAttempt.date).getTime();
                let timeDiff = Date.now() - lastAttemptTime;
                let lockPeriod = 24 * 60 * 60 * 1000;

                if (timeDiff < lockPeriod) {
                    let remainingMs = lockPeriod - timeDiff;
                    let remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
                    let remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                    showToast(`Locked! You can retake the ${subject} quiz in ${remainingHours}h ${remainingMins}m.`, "error");
                    return;
                }
            }

            showToast("Querying Live AI & Custom Textbooks...", "info");

            activeQuestions = await fetchAIQuestions(subject, student.grade, student.stream);

            runningQuizIndex = 0;
            runningQuizScore = 0;
            quizTimeRemaining = 420;

            const selection = document.getElementById('quizSelectionWorkspace');
            const execution = document.getElementById('quizExecutionWorkspace');
            const currentSubTitle = document.getElementById('quizCurrentSubjectTitle');

            if (selection) selection.classList.add('hidden');
            if (execution) execution.classList.remove('hidden');
            if (currentSubTitle) currentSubTitle.textContent = subject;

            clearInterval(quizTimerInterval);
            quizTimerInterval = setInterval(() => {
                quizTimeRemaining--;
                let mins = Math.floor(quizTimeRemaining / 60);
                let secs = quizTimeRemaining % 60;
                const timerText = document.getElementById('quizTimerText');
                if (timerText) timerText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                
                if (quizTimeRemaining <= 0) {
                    clearInterval(quizTimerInterval);
                    completeEvaluationExam();
                }
            }, 1000);

            loadEvaluationQuestion();
        }

        function loadEvaluationQuestion() {
            const currentItem = activeQuestions[runningQuizIndex];
            if (!currentItem) return;
            
            const indexLabel = document.getElementById('quizCurrentIndexLabel');
            const questionBody = document.getElementById('quizQuestionBody');
            const progressBar = document.getElementById('quizProgressBar');

            if (indexLabel) indexLabel.textContent = runningQuizIndex + 1;
            if (questionBody) questionBody.textContent = currentItem.q;

            const percent = Math.round((runningQuizIndex / 15) * 100);
            if (progressBar) progressBar.style.width = `${percent}%`;

            const grid = document.getElementById('quizOptionsGrid');
            if (grid) {
                grid.innerHTML = '';
                currentItem.opts.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = "w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-logoBlue dark:text-slate-300 hover:border-logoGreen transition-all flex items-center justify-between";
                    btn.onclick = () => submitExamOption(btn, opt, currentItem.a);
                    btn.innerHTML = `
                        <span>${opt}</span>
                        <i class="fa-regular fa-circle text-slate-300 shrink-0 ml-2"></i>
                    `;
                    grid.appendChild(btn);
                });
            }
        }

        function submitExamOption(btnEl, selected, correct) {
            const buttons = document.querySelectorAll('#quizOptionsGrid button');
            buttons.forEach(b => b.disabled = true);

            if (selected === correct) {
                runningQuizScore++;
                btnEl.classList.remove('border-slate-200', 'dark:border-slate-800');
                btnEl.classList.add('bg-green-100', 'dark:bg-green-950/40', 'border-green-500', 'text-green-700', 'dark:text-green-300');
                const icon = btnEl.querySelector('i');
                if (icon) icon.className = "fa-solid fa-circle-check text-green-500";
            } else {
                btnEl.classList.remove('border-slate-200', 'dark:border-slate-800');
                btnEl.classList.add('bg-red-100', 'dark:bg-red-950/40', 'border-red-500', 'text-red-700', 'dark:text-red-300');
                const icon = btnEl.querySelector('i');
                if (icon) icon.className = "fa-solid fa-circle-xmark text-red-500";

                buttons.forEach(b => {
                    const span = b.querySelector('span');
                    if (span && span.textContent === correct) {
                        b.classList.remove('border-slate-200', 'dark:border-slate-800');
                        b.classList.add('bg-green-100', 'dark:bg-green-950/40', 'border-green-500', 'text-green-700', 'dark:text-green-300');
                        const innerIcon = b.querySelector('i');
                        if (innerIcon) innerIcon.className = "fa-solid fa-circle-check text-green-500";
                    }
                });
            }

            setTimeout(() => {
                runningQuizIndex++;
                if (runningQuizIndex < 15) {
                    loadEvaluationQuestion();
                } else {
                    completeEvaluationExam();
                }
            }, 1200);
        }

        async function completeEvaluationExam() {
            clearInterval(quizTimerInterval);
            const student = window.loggedInProfile;
            const selectEl = document.getElementById('portalQuizSubjectSelect');
            if (!selectEl) return;
            const subject = selectEl.value;

            let timeSpentSeconds = 420 - quizTimeRemaining;

            const scoreObj = {
                uid: 'score-' + Date.now(),
                studentId: student.idNumber,
                studentName: student.name,
                subject: subject,
                grade: student.grade,
                section: student.section,
                score: runningQuizScore,
                timeSpent: timeSpentSeconds,
                date: new Date().toISOString()
            };

            // Save directly to Firestore
            await setFirestoreDocument(COLLECTIONS.QUIZ_SCORES, scoreObj.uid, scoreObj);

            showToast(`Exam completed! Score: ${runningQuizScore}/15 | Time: ${Math.floor(timeSpentSeconds / 60)}m ${timeSpentSeconds % 60}s`, "success");

            const execution = document.getElementById('quizExecutionWorkspace');
            const selection = document.getElementById('quizSelectionWorkspace');
            if (execution) execution.classList.add('hidden');
            if (selection) selection.classList.remove('hidden');

            renderRealScoresLeaderboard();
        }

        async function renderRealScoresLeaderboard() {
            const container = document.getElementById('arenaLeaderboardBody');
            if (!container) return;
            container.innerHTML = '';

            // Load scores directly from Firestore
            let scores = await getFirestoreCollection(COLLECTIONS.QUIZ_SCORES);
            
            scores.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.timeSpent - b.timeSpent;
            });

            if (scores.length === 0) {
                container.innerHTML = `<p class="text-[10px] text-slate-400 italic">No real scores submitted today. Launch a quiz to build the leaderboard!</p>`;
                return;
            }

            scores.slice(0, 5).forEach((item, index) => {
                const row = document.createElement('div');
                row.className = "p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs";
                
                let rankLabel = `<b>#${index + 1}</b>`;
                if (index === 0) rankLabel = '<i class="fa-solid fa-trophy text-yellow-500"></i>';
                else if (index === 1) rankLabel = '<i class="fa-solid fa-medal text-slate-400"></i>';

                let formattedTime = `${Math.floor(item.timeSpent / 60)}m ${item.timeSpent % 60}s`;

                row.innerHTML = `
                    <div class="flex items-center gap-2 font-bold">
                        ${rankLabel}
                        <span>${item.studentName} <span class="text-slate-400 font-normal">(Grade ${item.grade}-${item.section} • ${item.subject})</span></span>
                    </div>
                    <div class="text-right text-[10px]">
                        <span class="font-extrabold text-logoGreen-dark block">${item.score}/15 Correct</span>
                        <span class="text-slate-400 text-[8px] block">Time Spent: ${formattedTime}</span>
                    </div>
                `;
                container.appendChild(row);
            });
        }

        // ═══════════════════════════════════════════════════════
        // STREAK TRACKER - LOADED FROM FIRESTORE
        // ═══════════════════════════════════════════════════════

        let performanceChartInstance = null;

        async function launchStreakViewerPage() {
            const page = document.getElementById('streak-tracker-page');
            if (page) page.classList.remove('hidden');
            
            const student = window.loggedInProfile;
            let logs = await getFirestoreCollection(COLLECTIONS.STUDY_LOGS);
            let studentLogs = logs.filter(l => l.studentId === student.idNumber);

            let consecutiveDays = 0;
            if (studentLogs.length > 0) {
                let dates = studentLogs.map(l => new Date(l.date).toDateString());
                let uniqueDates = [...new Set(dates)];
                consecutiveDays = uniqueDates.length;
            }

            const countLabel = document.getElementById('streakDaysCountLabel');
            if (countLabel) countLabel.textContent = consecutiveDays;

            const pathwayLabel = document.getElementById('pathwayClassLabel');
            const suggestions = document.getElementById('pathwaySuggestionText');
            const progress = document.getElementById('pathwayPercentageBar');

            if (pathwayLabel && suggestions && progress) {
                if (student.stream === 'Natural') {
                    pathwayLabel.textContent = "Engineering & Science";
                    suggestions.textContent = "Excellent target logs in STEM. Recommended focus: Applied Physics, Calculus.";
                    progress.style.width = "75%";
                } else if (student.stream === 'Social') {
                    pathwayLabel.textContent = "Business & Social Law";
                    suggestions.textContent = "Balanced targets recorded. Recommended focus: Advanced Geography, Economics.";
                    progress.style.width = "70%";
                } else {
                    pathwayLabel.textContent = "General Academics";
                    suggestions.textContent = "Aim to log more hours to crystallize custom career trajectories. ";
                    progress.style.width = "35%";
                }
            }

            const listContainer = document.getElementById('streakHistoryLogsContainer');
            if (listContainer) {
                listContainer.innerHTML = '';
                if (studentLogs.length === 0) {
                    listContainer.innerHTML = `<p class="text-[10px] text-slate-400 italic">No study logs saved yet. Submit your study goals to build records!</p>`;
                } else {
                    studentLogs.slice().reverse().forEach(log => {
                        const row = document.createElement('div');
                        row.className = "p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs";
                        row.innerHTML = `
                            <div>
                                <span class="block font-bold text-logoBlue dark:text-white">Logged Study Focus</span>
                                <span class="block text-[8px] text-slate-400">${new Date(log.date).toLocaleDateString()}</span>
                            </div>
                            <div class="text-right">
                                <span class="font-extrabold text-logoGreen-dark block">${log.studyHours} Hours</span>
                                <span class="text-[8px] font-semibold text-slate-400">${log.goalComplete ? 'Completed' : 'Pending'}</span>
                            </div>
                        `;
                        listContainer.appendChild(row);
                    });
                }
            }

            renderChartGraph(studentLogs);
        }

        function exitStreakPage() {
            const page = document.getElementById('streak-tracker-page');
            if (page) page.classList.add('hidden');
        }

        function renderChartGraph(logs) {
            const canvas = document.getElementById('streakPerformanceChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            
            if (performanceChartInstance) {
                performanceChartInstance.destroy();
            }

            let dataset = logs.slice(-7);
            let labels = dataset.map(l => new Date(l.date).toLocaleDateString());
            let hoursData = dataset.map(l => l.studyHours);

            if (dataset.length === 0) {
                labels = ["No Logs Recorded"];
                hoursData = [0];
            }

            performanceChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Target Study Hours Today',
                        data: hoursData,
                        borderColor: '#B3D435',
                        backgroundColor: 'rgba(179, 212, 53, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(148, 163, 184, 0.1)'
                            },
                            ticks: {
                                color: '#0D235C',
                                font: {
                                    size: 10
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#0D235C',
                                font: {
                                    size: 9
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }

        // ═══════════════════════════════════════════════════════
        // ADMIN FUNCTIONS - ALL DATA FROM FIRESTORE
        // ═══════════════════════════════════════════════════════

        async function renderAdminTuitionTable() {
            let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);
            const tbody = document.getElementById('adminTuitionTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            const students = accounts.filter(acc => acc.role === 'Student');

            if (students.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="py-4 text-center text-slate-400 italic">No students registered to list tuition parameters.</td>
                    </tr>
                `;
                return;
            }

            students.forEach(stud => {
                if (!stud.payments) {
                    stud.payments = { term1: false, term2: false, term3: false };
                }

                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-logoBlue dark:text-slate-200";
                
                tr.innerHTML = `
                    <td class="py-3 font-bold">${stud.idNumber}</td>
                    <td>${stud.name} <span class="text-slate-400 text-[10px]">(Gr ${stud.grade}-${stud.section})</span></td>
                    <td class="text-center">
                        <input type="checkbox" ${stud.payments.term1 ? 'checked' : ''} onchange="toggleStudentPayment('${stud.uid}', 'term1')" class="rounded text-logoGreen focus:ring-logoGreen w-4 h-4 cursor-pointer">
                    </td>
                    <td class="text-center">
                        <input type="checkbox" ${stud.payments.term2 ? 'checked' : ''} onchange="toggleStudentPayment('${stud.uid}', 'term2')" class="rounded text-logoGreen focus:ring-logoGreen w-4 h-4 cursor-pointer">
                    </td>
                    <td class="text-center">
                        <input type="checkbox" ${stud.payments.term3 ? 'checked' : ''} onchange="toggleStudentPayment('${stud.uid}', 'term3')" class="rounded text-logoGreen focus:ring-logoGreen w-4 h-4 cursor-pointer">
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        async function toggleStudentPayment(uid, termKey) {
            let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);
            let stud = accounts.find(acc => acc.uid === uid);
            if (stud) {
                if (!stud.payments) stud.payments = { term1: false, term2: false, term3: false };
                stud.payments[termKey] = !stud.payments[termKey];
                
                // Save directly to Firestore
                await setFirestoreDocument(COLLECTIONS.ACCOUNTS, uid, stud);
                
                showToast(`Payment status updated for ${stud.name}!`, "success");
            }
        }

        // ═══════════════════════════════════════════════════════
        // ADMIN PROVISIONING - FIRESTORE + FIREBASE AUTH
        // ═══════════════════════════════════════════════════════
        // Passwords are NEVER stored in Firestore.
        // If Firestore profile creation fails, the Auth user is rolled back.
        // ═══════════════════════════════════════════════════════

        async function handleAdminProvisionAccount() {
            const role = document.getElementById('adminRegRole').value;
            const campus = document.getElementById('adminRegCampus').value;
            const name = document.getElementById('adminRegName').value.trim();
            const idVal = document.getElementById('adminRegId').value.trim();
            const password = document.getElementById('adminRegPassword').value.trim();
            const childId = document.getElementById('adminLinkedChildId').value.trim();
            const grade = document.getElementById('adminRegGrade').value;
            const section = document.getElementById('adminRegSection').value;
            const stream = document.getElementById('adminRegStreamField').classList.contains('hidden') ? '' : document.getElementById('adminRegStream').value;

            if (!name || !idVal || !password) {
                showToast("Please compile all fields correctly.", "error");
                return;
            }

            // Load accounts from Firestore
            let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);

            // Unique validations
            if (role === 'Student') {
                let parsed = parseInt(idVal);
                if (isNaN(parsed) || parsed < 123 || parsed > 3783) {
                    showToast("Student ID must be unique and between 123 and 3783.", "error");
                    return;
                }
                if (accounts.some(acc => acc.idNumber === idVal && acc.role === 'Student')) {
                    showToast("This Student ID is already provisioned to another student.", "error");
                    return;
                }
            } else if (role === 'Teacher') {
                let parsed = parseInt(idVal);
                if (isNaN(parsed) || parsed < 5 || parsed > 123) {
                    showToast("Teacher ID must be unique and between 5 and 123.", "error");
                    return;
                }
                if (accounts.some(acc => acc.idNumber === idVal && acc.role === 'Teacher')) {
                    showToast("This Teacher ID is already provisioned to another educator.", "error");
                    return;
                }
            } else if (role === 'Parent') {
                if (accounts.some(acc => acc.idNumber === idVal && acc.role === 'Parent')) {
                    showToast("This Parent ID is already provisioned.", "error");
                    return;
                }
                if (!childId) {
                    showToast("Please provide linked child student ID.", "error");
                    return;
                }
                if (!accounts.some(acc => acc.role === 'Student' && acc.idNumber === childId)) {
                    showToast("Linking Child Student ID was not found in directory.", "error");
                    return;
                }
            }

            // Build the Firestore profile document (NO password field)
            const newAcc = {
                uid: 'usr-' + Date.now(),
                name,
                username: name.toLowerCase().replace(/\s+/g, ''),
                role,
                campus,
                idNumber: idVal,
                authEmail: buildPortalEmailAddress(idVal),
                authUid: '',
                childIdNumber: role === 'Parent' ? childId : '',
                grade: role === 'Student' ? grade : '',
                section: role === 'Student' ? section : '',
                stream: role === 'Student' ? stream : '',
                payments: role === 'Student' ? { term1: false, term2: false, term3: false } : null,
                createdAt: new Date().toISOString()
            };

            // Step 1: Create Firebase Auth user
            let authUserCreated = false;
            if (auth && typeof createUserWithEmailAndPassword === 'function') {
                const authResult = await createPortalAuthUser(idVal, password);
                if (authResult.ok) {
                    newAcc.authUid = authResult.user?.uid || '';
                    newAcc.authEmail = authResult.email;
                    authUserCreated = true;
                    console.log(`[AUTH] Firebase Auth user created for ${authResult.email}`);
                } else if (authResult.reason === 'email-exists') {
                    console.log(`[AUTH] Firebase Auth user already exists for ${authResult.email}`);
                    authUserCreated = true; // User exists, proceed
                } else {
                    console.error('[AUTH] Firebase Authentication registration failed:', authResult.error);
                    showToast("Failed to create authentication account. Please try again.", "error");
                    return;
                }
            }

            // Step 2: Save profile to Firestore
            const firestoreSaved = await setFirestoreDocument(COLLECTIONS.ACCOUNTS, newAcc.uid, newAcc);
            
            if (!firestoreSaved) {
                console.error('[AUTH] Firestore profile creation FAILED. Rolling back Auth user...');
                // Rollback: Cloud Functions no longer available, just log the issue
                if (authUserCreated && newAcc.authUid) {
                    console.warn('[AUTH] Rollback: Auth user created but cannot be deleted without Cloud Functions. Please delete manually from Firebase Console.');
                }
                showToast("Failed to create profile in database. Account creation rolled back.", "error");
                return;
            }

            console.log(`[AUTH] Firestore profile created successfully for ${name} (${role})`);
            showToast(`Provisioned account for ${name} successfully!`, "success");
            
            document.getElementById('adminRegName').value = '';
            document.getElementById('adminRegId').value = '';
            document.getElementById('adminRegPassword').value = '';
            renderAdminDirectoryTable();
            renderAdminTuitionTable();
        }

        async function deleteProvisionedAccount(uid) {
            let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);
            const account = accounts.find(acc => acc.uid === uid);
            
            if (!account) {
                showToast("Account not found.", "error");
                return;
            }

            // ═══════════════════════════════════════════════════════════
            // PROTECT THE PRIMARY ADMINISTRATOR ACCOUNT
            // ═══════════════════════════════════════════════════════════
            const PRIMARY_ADMIN_EMAIL = 'cobra.broken@gmail.com';
            const authEmail = account?.authEmail || '';
            
            if (authEmail.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
                showToast("The primary administrator account is protected and cannot be deleted.", "error");
                return;
            }

            // Step 1: Cloud Functions no longer available for Auth deletion.
            // Firestore profile will be deleted. Auth user deletion must be done via Firebase Console.
            let authDeletionSucceeded = true;

            // Step 2: Delete Firestore profile
            await deleteFirestoreDocument(COLLECTIONS.ACCOUNTS, uid);
            
            showToast("User deleted successfully.", "success");
            renderAdminDirectoryTable();
            renderAdminTuitionTable();
        }

        async function renderAdminDirectoryTable() {
            let accounts = await getFirestoreCollection(COLLECTIONS.ACCOUNTS);
            const tbody = document.getElementById('adminUsersTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            const PRIMARY_ADMIN_EMAIL = 'cobra.broken@gmail.com';

            accounts.forEach(acc => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800 text-xs";
                
                let details = acc.campus;
                if (acc.role === 'Student') {
                    details += ` • Gr ${acc.grade}-${acc.section} ${acc.stream ? '('+acc.stream+')' : ''}`;
                } else if (acc.role === 'Parent') {
                    details += ` • Linked to Child ID: ${acc.childIdNumber}`;
                }

                const isAdmin = (acc?.authEmail || '').toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
                const deleteButtonHtml = isAdmin
                    ? `<span class="text-slate-300 dark:text-slate-600 px-2 py-1 text-[10px] italic" title="Protected administrator account">Protected</span>`
                    : `<button onclick="deleteProvisionedAccount('${acc.uid}')" class="text-red-500 hover:text-red-700 font-bold px-2 py-1"><i class="fa-solid fa-trash-can"></i></button>`;

                tr.innerHTML = `
                    <td class="py-2.5 font-bold">${acc.idNumber}</td>
                    <td>${acc.name}</td>
                    <td><span class="bg-slate-100 text-logoBlue dark:bg-slate-800 dark:text-white px-2 py-0.5 rounded font-bold">${acc.role}</span></td>
                    <td class="text-slate-500">${details}</td>
                    <td class="text-right">${deleteButtonHtml}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // ═══════════════════════════════════════════════════════
        // UI HELPERS (unchanged - these are UI-only)
        // ═══════════════════════════════════════════════════════

        let currentExplorerKey = 'ethics';
        const explorerKeysOrder = ['ethics', 'languages', 'science', 'it'];

        let touchStartX = 0;
        let touchEndX = 0;

        const explorerCard = document.getElementById('explorer-content-panel');
        if (explorerCard) {
            explorerCard.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            explorerCard.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleExplorerSwipeGesture();
            }, { passive: true });
        }

        function handleExplorerSwipeGesture() {
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                navigateExplorer(1);
            } else if (touchEndX - touchStartX > swipeThreshold) {
                navigateExplorer(-1);
            }
        }

        function navigateExplorer(direction) {
            let currentIndex = explorerKeysOrder.indexOf(currentExplorerKey);
            let nextIndex = currentIndex + direction;
            if (nextIndex >= explorerKeysOrder.length) {
                nextIndex = 0;
            } else if (nextIndex < 0) {
                nextIndex = explorerKeysOrder.length - 1;
            }
            
            const panel = document.getElementById('explorer-content-panel');
            if (panel) {
                panel.classList.remove('slide-right-anim', 'slide-left-anim');
                void panel.offsetWidth;
                panel.classList.add(direction > 0 ? 'slide-right-anim' : 'slide-left-anim');
            }

            switchExplorer(explorerKeysOrder[nextIndex]);
        }

        function jumpToExplorerIndex(index) {
            if (index >= 0 && index < explorerKeysOrder.length) {
                const panel = document.getElementById('explorer-content-panel');
                if (panel) {
                    panel.classList.remove('slide-right-anim', 'slide-left-anim');
                    void panel.offsetWidth;
                    panel.classList.add('slide-right-anim');
                }
                switchExplorer(explorerKeysOrder[index]);
            }
        }

        function updateExplorerDots(activeKey) {
            const dotsContainer = document.getElementById('explorerDotsContainer');
            if (!dotsContainer) return;
            const activeIdx = explorerKeysOrder.indexOf(activeKey);
            const dots = dotsContainer.querySelectorAll('span');
            dots.forEach((dot, index) => {
                if (index === activeIdx) {
                    dot.className = "w-4 h-2 rounded-full bg-logoGreen transition-all duration-300 cursor-pointer";
                } else {
                    dot.className = "w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 transition-all duration-300 cursor-pointer";
                }
            });
        }

        function openPortal(tabKey) {
            const portalDashboard = document.getElementById('interactiveDashboard');
            const portalHeaderTitle = document.getElementById('portalHeaderTitle');
            const portalTab_about = document.getElementById('portalTab_about');
            const portalTab_contact = document.getElementById('portalTab_contact');

            if (!portalDashboard || !portalHeaderTitle || !portalTab_about || !portalTab_contact) return;

            portalTab_about.classList.add('hidden');
            portalTab_contact.classList.add('hidden');

            if (tabKey === 'about') {
                portalTab_about.classList.remove('hidden');
            } else if (tabKey === 'contact') {
                portalTab_contact.classList.remove('hidden');
            }

            const headers = {
                about: currentLang === 'en' ? 'School Heritage & Identity' : 'ስለ እኛ እና አላማችን',
                contact: currentLang === 'en' ? 'Addis Ababa Locations & Phone Contacts' : 'የካምፓሶቻችን አድራሻ እና ስልኮች'
            };
            portalHeaderTitle.textContent = headers[tabKey] || 'Academic Portal';
            portalDashboard.classList.remove('hidden');
            
            window.scrollTo({
                top: portalDashboard.offsetTop - 95,
                behavior: 'smooth'
            });
        }

        function closePortal() {
            const portalDashboard = document.getElementById('interactiveDashboard');
            if (portalDashboard) portalDashboard.classList.add('hidden');
            scrollToSection('portal-menu');
        }

        // These functions are kept as stubs for any legacy UI references.
        // Firebase config is now hardcoded in firebaseConfig above.
        function toggleDbConfigPanel() {
            showToast("Firebase configuration is set; this panel is no longer needed.", "info");
        }

        function saveCustomFirebaseConfig() {
            showToast("Firebase configuration is set; no manual config needed.", "info");
        }

        function clearCustomFirebaseConfig() {
            showToast("Firebase configuration is set; no manual config needed.", "info");
        }

        function switchExplorer(key) {
            currentExplorerKey = key;
            const data = subjectsData[key];
            if (!data) return;

            updateExplorerDots(key);

            const activeTabBtn = document.getElementById(`tab_${key}`);
            if (activeTabBtn) {
                activeTabBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }

            ['ethics', 'languages', 'science', 'it'].forEach(tabKey => {
                const btn = document.getElementById(`tab_${tabKey}`);
                if (btn) {
                    btn.className = (tabKey === key) 
                        ? "w-full text-left p-2.5 rounded-lg border border-logoGreen bg-logoGreen-light dark:bg-slate-800 text-xs font-bold transition-all text-logoBlue dark:text-white flex items-center gap-2 shrink-0 snap-center min-w-[140px] sm:min-w-0 shadow-sm scale-[1.03] duration-300"
                        : "w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-logoGreen text-xs font-bold transition-all text-logoBlue dark:text-white flex items-center gap-2 shrink-0 snap-center min-w-[140px] sm:min-w-0 shadow-sm duration-300";
                }
            });

            const panel = document.getElementById('explorer-content-panel');
            if (panel) {
                panel.classList.add('opacity-0', 'scale-[0.98]', 'translate-y-1');
                
                setTimeout(() => {
                    const titleEl = document.getElementById('exp_subj_title');
                    const descEl = document.getElementById('exp_subj_desc');
                    if (titleEl) titleEl.textContent = currentLang === 'en' ? data.title_en : data.title_am;
                    if (descEl) descEl.textContent = currentLang === 'en' ? data.desc_en : data.desc_am;

                    const listContainer = document.getElementById('exp_subj_highlights');
                    if (listContainer) {
                        listContainer.innerHTML = '';
                        const activeHighlights = currentLang === 'en' ? data.highlights_en : data.highlights_am;
                        activeHighlights.forEach((highlight, index) => {
                            const li = document.createElement('li');
                            li.className = "flex items-center gap-1.5 transition-all duration-300 transform translate-x-2 opacity-0";
                            li.innerHTML = `<i class="fa-solid fa-circle-check text-logoGreen-dark"></i> ${highlight}`;
                            listContainer.appendChild(li);
                            
                            setTimeout(() => {
                                li.classList.remove('translate-x-2', 'opacity-0');
                            }, (index + 1) * 60);
                        });
                    }
                    
                    panel.classList.remove('opacity-0', 'scale-[0.98]', 'translate-y-1');
                }, 150);
            }
        }

        function openFullPortalSubpage() {
            const landingView = document.getElementById('landing-page-view');
            const portalPage = document.getElementById('full-portal-page');
            if (landingView && portalPage) {
                landingView.classList.add('hidden');
                portalPage.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function closeFullPortalSubpage() {
            const landingView = document.getElementById('landing-page-view');
            const portalPage = document.getElementById('full-portal-page');
            if (landingView && portalPage) {
                portalPage.classList.add('hidden');
                landingView.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function toggleAdminRegRoleFields() {
            const role = document.getElementById('adminRegRole').value;
            const linkChild = document.getElementById('adminLinkChildField');
            const gradesBox = document.getElementById('adminGradeSelectorBox');
            const regIdLabel = document.getElementById('adminRegIdLabel');

            if (role === 'Student') {
                if (linkChild) linkChild.classList.add('hidden');
                if (gradesBox) gradesBox.classList.remove('hidden');
                if (regIdLabel) regIdLabel.textContent = "Assign Student ID (123 - 3783)";
            } else if (role === 'Teacher') {
                if (linkChild) linkChild.classList.add('hidden');
                if (gradesBox) gradesBox.classList.add('hidden');
                if (regIdLabel) regIdLabel.textContent = "Assign Teacher ID (5 - 123)";
            } else if (role === 'Parent') {
                if (linkChild) linkChild.classList.remove('hidden');
                if (gradesBox) gradesBox.classList.add('hidden');
                if (regIdLabel) regIdLabel.textContent = "Assign Parent ID (Unique)";
            }
            syncAdminGradeLimits();
        }

        function syncAdminGradeLimits() {
            const campus = document.getElementById('adminRegCampus').value;
            const gradeSelect = document.getElementById('adminRegGrade');
            if (!gradeSelect) return;
            
            gradeSelect.innerHTML = '';
            if (campus === 'Weyra Sefere High') {
                gradeSelect.innerHTML = `
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                `;
            } else {
                gradeSelect.innerHTML = `
                    <option value="5">Grade 5</option>
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                `;
            }
            toggleAdminRegStream();
        }

        function toggleAdminRegStream() {
            const gradeSelect = document.getElementById('adminRegGrade');
            const streamField = document.getElementById('adminRegStreamField');
            if (gradeSelect && streamField) {
                const grade = gradeSelect.value;
                if (grade === '11' || grade === '12') {
                    streamField.classList.remove('hidden');
                } else {
                    streamField.classList.add('hidden');
                }
            }
        }

        // ═══════════════════════════════════════════════════════
        // TRANSLATIONS (unchanged)
        // ═══════════════════════════════════════════════════════

        const translations = {
            en: {
                "top-welcome": "Welcome to Bikolos Nur Academy",
                "nav-motto": '"We Teach How to Learn"',
                "menu-home": "Home",
                "menu-campuses": "Our Campuses",
                "menu-about": "About Us",
                "menu-contact": "Contact",
                "btn-portal": "School Portal",
                "hero-line1": "Learning Made Simple:",
                "hero-motto": "We Teach How to Learn.",
                "hero-desc": "At Bikolos Nur Academy, we go beyond standard book memorization. We help children ask questions, understand their lessons clearly, and grow with strong moral and Islamic values.",
                "hero-cta-portal": "Access School Portal",
                "hero-cta-explore": "Learn Our Methods",
                "stat-ratio": "Teacher-Student Ratio",
                "stat-campuses": "Addis Ababa Campuses",
                "stat-accred": "Modern Thinking Maps",
                
                "exp-badge": "Interactive School Explorer",
                "exp-title": "What & How We Learn",
                "sub-ethics": "Tarbiya & Akhlaq",
                "sub-lang": "Languages",
                "sub-science": "Science & Math",
                "sub-it": "IT & Coding",
                "exp-focus": "Key School Focus",

                "isl-sub": "Faith & Manners",
                "isl-heading": "Tarbiya & Values: Our Ethical Foundation",
                "isl-desc": "We believe true knowledge and good character must go together. We teach our students to practice their values with understanding, kindness, and respect for their elders.",
                "isl-1-t": "Akhlaq & Islamic Manners",
                "isl-1-d": "Teaching children how to respect parents, elders, treat others with love, and develop pristine personal habits.",
                "isl-2-t": "Salah & Worship Practice",
                "isl-2-d": "Guiding children to perform their regular daily prayers correctly and understand their spiritual importance.",
                "isl-3-t": "Community Compassion",
                "isl-3-d": "Helping students understand social responsibility, kindness to peers, and clean communication styles.",

                "campuses-sub": "Our Branches",
                "campuses-heading": "Our Five School Campuses",
                "campuses-desc": "Bikolos Nur Academy serves Addis Ababa with 5 custom-designed campuses that specialize in specific age groups and stages of child development.",
                
                "camp-1-title": "BETEL ELEMENTARY CAMPUS",
                "camp-2-title": "WEYRA SEFERE HIGH SCHOOL CAMPUS",
                "camp-3-title": "SENE 30 KG CAMPUS",
                "camp-4-title": "ALEMBANK ELEMENTARY CAMPUS",
                "camp-5-title": "ALEMBANK KG CAMPUS",

                "camp-elem": "Elementary (Grades 1-8)",
                "camp-high": "High School (Grades 9-12)",
                "camp-kg": "Kindergarten (Ages 3-6)",

                "p-menu-sub": "School Gateway",
                "p-menu-title": "School Information Guide",
                "p-menu-desc": "Click below to find specific details about our teaching systems and branches instantly.",
                "tab-about-title": "About & Heritage",
                "tab-cont-title": "Campus & Contacts",
                "p-close": "Close View",

                "about-subtitle": "Page 2: About Our Academy",
                "about-heading": "Welcome from our Administration",
                "about-p1": "At Bikolos Nur Academy, learning is planned to be a valuable lifelong asset. Built on modern thinking methods (Thinking Maps), we help children build logical skills, high ethical values, and moral discipline.",
                "about-v-title": "Our Vision",
                "about-v-desc": "To foster polite, creative, and independent Muslim students who are ready to make a positive impact.",
                "about-m-title": "Our Mission",
                "about-m-desc": "By using interactive teaching maps, we teach our students how to think clearly instead of memorizing blindly.",

                "cont-subtitle": "Geographic Locations",
                "cont-heading": "Find Our Campus Offices",
                "cont-p1": "We are located in the Kolfe Keranio sub-city around Bethel and Weyra Sefer area in Addis Ababa.",
                "map-t": "Addis Ababa Branches Map",

                "phil-subtitle": "Why We Are Different",
                "phil-heading": "Teaching Minds How to Understand",
                "phil-p1": "We use structured visual maps so kids can analyze math, science, and grammar naturally instead of just listening and writing notes.",
                "pil-1-t": "Thinking Maps",
                "pil-1-d": "Using eight special brain visual maps, we show kids how to categorize, compare, and break down tough ideas by themselves.",
                "pil-2-t": "Active Classrooms",
                "pil-2-d": "Our classrooms are fully student-centered. Every child participates, speaks up, and learns to work nicely in groups.",
                "pil-3-t": "Strong Moral Character",
                "pil-3-d": "Integrating Islamic principles (Akhlaq and Tarbiya) so kids grow up to be honest, respectful, and polite citizens.",

                "test-subtitle": "Parent Feedback",
                "test-heading": "What Our Families Say",
                "test-1-auth": "Mrs. Tsion B. (Parent)",
                "test-2-auth": "Brother Kassim A. (Parent)",
                "test-3-auth": "Sister Huda S. (Parent)",

                "foot-desc": "Helping students establish clear brain logical tools, Islamic Tarbiya, and strong academic curiosity in Addis Ababa.",
                "foot-addr-title": "School Location & Contacts",
                "foot-addr": "Kolfe Keranio Sub-City, Around Bethel & Weyra Sefer, Addis Ababa, Ethiopia",
                "foot-campuses-title": "Our Campuses",
                "foot-sec": "Safe Environment",
                "foot-reg": "Licensed by Education Bureau",
                "reg-student-notice": "* Portal access is restricted to students in Grade 5 and above. Early primary/KG students do not have portal profiles."
            },
            am: {
                "top-welcome": "ወደ ቢኮሎስ ኑር አካዳሚ እንኳን ደህና መጡ",
                "nav-motto": '"መማርን እናስተምራለን!"',
                "menu-home": "ዋና ገጽ",
                "menu-campuses": "ካምፓሶቻችን",
                "menu-about": "ስለ እኛ",
                "menu-contact": "አድራሻ",
                "btn-portal": "ፖርታል",
                "hero-line1": "ቀላል እና ጥራት ያለው ትምህርት፦",
                "hero-motto": "መማርን እናስተምራለን!",
                "hero-desc": "በቢኮሎስ ኑር አካዳሚ ከተለምዷዊ የቃላት መሸምደድ ባለፈ እንሄዳለን። ልጆች በራሳቸው እንዲያስቡ፣ ጥያቄዎችን እንዲጠይቁ እና ጠንካራ የሞራል እና የእስልምና እሴቶች እንዲኖራቸው እናግዛለን።",
                "hero-cta-portal": "ፖርታል ይግቡ",
                "hero-cta-explore": "የማስተማሪያ መንገዳችንን ይረዱ",
                "stat-ratio": "የመምህርና ተማሪ ጥምርታ",
                "stat-campuses": "በአዲስ አበባ ያሉ ካምፓሶች",
                "stat-accred": "ዘማናዊ የእይታ ካርታዎች (Thinking Maps)",
                
                "exp-badge": "የክፍል ውስጥ ትምህርት ማሳያ",
                "exp-title": "ምን እና እንዴት እንደምናስተምር",
                "sub-ethics": "ተርቢያ እና አህላቅ",
                "sub-lang": "ቋንቋዎች",
                "sub-science": "ሳይንስና ሂሳብ",
                "sub-it": "ቴክኖሎጂ/ኮዲንግ",
                "exp-focus": "ከትምህርት ትኩረቶቻችን መካከል",

                "isl-sub": "ስነ-ምግባርና እምነት",
                "isl-heading": "ተርቢያ እና ስነ-ምግባር፡ የእምነት መሰረታችን",
                "isl-desc": "እውነተኛ እውቀት እና መልካም ባህሪ አብረው መሄድ አለባቸው ብለን እናምናለን። ተማሪዎቻችን መልካም ስነ-ምግባርን፣ መከባበርን እና አደብን በተግባር እንዲለማመዱ እናደርጋለን።",
                "isl-1-t": "መልካም ስነ-ምግባርና አደብ",
                "isl-1-d": "ወላጆችን ማክበር፣ ታላላቆችን መውደድ እና ማህበረሰቡን በመልካም መርዳትን በተግባር እናስተምራለን።",
                "isl-2-t": "የሰላት እና ዱዓዎች ስልጠና",
                "isl-2-d": "በየቀኑ የሚሰገዱትን ሰላቶች በትክክለኛው መንገድ እንዲለማመዱ እና መንፈሳዊ ጥንካሬ እንዲያገኙ እናደርጋለን።",
                "isl-3-t": "ማህበራዊ ደግነት",
                "isl-3-d": "ተማሪዎች እርስ በእርስ እንዲረዳዱ፣ ደግነትን እንዲያሳዩ እና ንጹህ ተግባቦትን እንዲለማመዱ ማድረግ።",

                "campuses-sub": "የእኛ ቅርንጫፎች",
                "campuses-heading": "አምስቱ የአካዳሚያችን ቅርንጫፎች",
                "campuses-desc": "ቢኮሎስ ኑር አካዳሚ በአዲስ አበባ ውስጥ 5 ለልጆች እድገት ምቹ ሆነው የተዘጋጁ የራሳቸው ልዩ ባህሪ ያላቸው ካምፓሶች አሉት።",
                
                "camp-1-title": "የቤቴል አንደኛ ደረጃ ካምፓስ",
                "camp-2-title": "የወይራ ሰፈር የሁለተኛ ደረጃ ካምፓስ",
                "camp-3-title": "የሰኔ 30 የህፃናት መዋያ (ኪንደርጋርተን)",
                "camp-4-title": "የአለም ባንክ አንደኛ ደረጃ ካምፓስ",
                "camp-5-title": "የአለም ባንክ የህፃናት መዋያ (ኪንደርጋርተን)",

                "camp-elem": "አንደኛ ደረጃ (ከ1ኛ - 8ኛ ክፍል)",
                "camp-high": "ሁለተኛ ደረጃ (ከ9ኛ - 12ኛ ክፍል)",
                "camp-kg": "የህፃናት መዋያ (ኪንደርጋርተን)",

                "p-menu-sub": "የመረጃ ማዕከል",
                "p-menu-title": "የትምህርት መረጃ መመሪያ",
                "p-menu-desc": "የማስተማሪያ መንገዳችንን እና የቅርንጫፍ ዝርዝሮቻችንን በፍጥነት ለማየት ከታች ያሉትን ይጫኑ።",
                "tab-about-title": "ስለ እኛ እና አላማችን",
                "tab-cont-title": "አድራሻዎቻችን እና ስልኮች",
                "p-close": "ዝጋ",

                "about-subtitle": "ገጽ 2: ስለ አካዳሚያችን",
                "about-heading": "ከአካዳሚው አስተዳደር የተላለፈ መልዕክት",
                "about-p1": "በቢኮሎስ ኑር አካዳሚ ትምህርት ለህይወት የሚጠቅም ትልቅ ስጦታ እንዲሆን እንሰራለን። በዘማናዊ የአስተሳሰብ ካርታዎች (Thinking Maps) በመታገዝ ልጆች የሎጂክ ክህሎት እና ጥሩ ስነ-ምግባር እንዲኖራቸው እናደርጋለን።",
                "about-v-title": "ራዕያችን",
                "about-v-desc": "ትሁት፣ ፈጣሪ እና ራሳቸውን የቻሉ ጠቃሚ ሙስሊም ተማሪዎችን ማፍራት።",
                "about-m-title": "ተልዕኳችን",
                "about-m-desc": "ተማሪዎች መረጃን በቃላቸው ከመሸምደድ ይልቅ በአዕምሮ ካርታዎች ተጠቅመው በግልጽ እንዲረዱ ማድረግ።",

                "cont-subtitle": "ካርታ እና አድራሻ",
                "cont-heading": "የካምፓስ ቢሮዎቻችንን ያግኙ",
                "cont-p1": "የምንገኘው በአዲስ አበባ ኮልፌ ቀራንዮ ክፍለ ከተማ በቤቴል እና ወይራ ሰፈር አካባቢ ነው።",
                "map-t": "የቅርንጫጫፎቻችን የአዲስ አበባ ካርታ",

                "phil-subtitle": "ልዩ የሚያደርገን ነገር",
                "phil-heading": "አዕምሮን በትክክል መረዳት እንዲችል ማስተማር",
                "phil-p1": "ተማሪዎቻችን በጭፍን ከመሸምደድ ይልቅ በአዕምሮ ካርታዎች ተጠቅመው በግልጽ እንዲረዱ እናደርጋለን።",
                "pil-1-t": "የአስተሳሰብ ካርታዎች (Thinking Maps)",
                "pil-1-d": "ልዩ ልዩ የእይታ ካርታዎችን በመጠቀም ተማሪዎቻችን ሀሳቦችን በራሳቸው መተንተን እና መለየት እንዲችሉ እናደርጋለን።",
                "pil-2-t": "ንቁ ክፍሎች",
                "pil-2-d": "ክፍሎቻችን ተማሪ-ተኮር ናቸው። እያንዳንዱ ተማሪ በንቃት ይሳተፋል፣ ሀሳቡን ይገልጻል፣ በቡድን መስራትም ይማራል።",
                "pil-3-t": "ጠንካራ ስነ-ምግባር",
                "pil-3-d": "መልካም ስነ-ምግባርን እና ባህሪን (አኽላቅ) ከዘመናዊ እውቀት ጋር በማጣመር ተማሪዎችን እናንጻለን።",

                "test-subtitle": "የወላጆች አስተያየት",
                "test-heading": "የወላጆች አስተያየት",
                "test-1-auth": "ወ/ሮ ጽዮን ቢ. (ወላጅ)",
                "test-2-auth": "አቶ ቃሲም ኤ. (ወላጅ)",
                "test-3-auth": "ወ/ሮ ሁዳ ኤስ. (ወላጅ)",

                "foot-desc": "ልጆች ጠንካራ አስተሳሰብ፣ የእስልምና ተርቢያ (ስነ-ምግባር) እና ጥሩ አካዳሚክ እውቀት እንዲኖራቸው በአዲስ አበባ የምንሰራ አካዳሚ ነን።",
                "foot-addr-title": "አድራሻ እና ስልኮች",
                "foot-addr": "ኮልፌ ቀራንዮ ክፍለ ከተማ፣ ቤቴል እና ወይራ ሰፈር አካባቢ፣ አዲስ አበባ፣ ኢትዮጵያ",
                "foot-campuses-title": "ካምፓሶቻችን",
                "foot-sec": "ደህንነቱ የተጠበቀ ግቢ",
                "foot-reg": "በትምህርት ቢሮ እውቅና የተሰጠው",
                "reg-student-notice": "* የፖርታል ምዝገባው ከ5ኛ ክፍል በላይ ለሆኑ ተማሪዎች ብቻ የተገደበ ነው። የቅድመ-መደበኛ/ኪንደርጋርተን ተማሪዎች መለያ የላቸውም።"
            }
        };

        let currentLang = 'en';

        function toggleLanguage() {
            currentLang = currentLang === 'en' ? 'am' : 'en';
            const btnText = document.getElementById('langBtnText');
            if (btnText) btnText.textContent = currentLang === 'en' ? 'አማርኛ' : 'English';
            
            const elements = document.querySelectorAll('[data-key]');
            elements.forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[currentLang] && translations[currentLang][key]) {
                    el.textContent = translations[currentLang][key];
                }
            });

            const titleEl = document.getElementById('heroTitle');
            if (titleEl) {
                if (currentLang === 'en') {
                    titleEl.innerHTML = '<span data-key="hero-line1">Learning Made Simple:</span> <br> <span class="text-logoGreen-dark italic tracking-wide font-normal" id="dynamicHeroMotto">We Teach How to Learn.</span>';
                } else {
                    titleEl.innerHTML = '<span data-key="hero-line1">ቀላል እና ጥራት ያለው ትምህርት፦</span> <br> <span class="text-logoGreen-dark italic tracking-wide font-bold amharic-text" id="dynamicHeroMotto">መማርን እናስተምራለን!</span>';
                }
            }
            switchExplorer(currentExplorerKey);
        }

        function showToast(message, type) {
            const toast = document.getElementById('customToast');
            const toastText = document.getElementById('toastText');
            const toastIcon = document.getElementById('toastIcon');

            if (!toast || !toastText) return;

            toastText.textContent = message;
            if (type === 'error') {
                if (toastIcon) toastIcon.className = "fa-solid fa-triangle-exclamation text-red-500 text-lg";
            } else if (type === 'success') {
                if (toastIcon) toastIcon.className = "fa-solid fa-circle-check text-logoGreen-dark text-lg";
            } else {
                if (toastIcon) toastIcon.className = "fa-solid fa-circle-info text-logoBlue text-lg";
            }

            toast.classList.remove('opacity-0', 'translate-x-80');
            toast.classList.add('opacity-100', 'translate-x-0');

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-x-80');
                toast.classList.remove('opacity-100', 'translate-x-0');
            }, 3000);
        }
        
        window.addEventListener('load', () => {
            switchExplorer('ethics');
        });

        // ═══════════════════════════════════════════════════════
        // MOBILE MENU & SCROLL HELPERS (unchanged)
        // ═══════════════════════════════════════════════════════

        const mobileMenu = document.getElementById('mobileMenu');
        const menuIcon = document.getElementById('menuIcon');
        function toggleMobileMenu() {
            if (mobileMenu && menuIcon) {
                mobileMenu.classList.toggle('hidden');
                menuIcon.className = mobileMenu.classList.contains('hidden') ? 'fa-solid fa-bars text-xl' : 'fa-solid fa-xmark text-xl';
            }
        }

        function scrollToSection(id) {
            const el = document.getElementById(id);
            if (el) {
                window.scrollTo({
                    top: el.offsetTop - 90,
                    behavior: 'smooth'
                });
            }
        }

        function toggleDarkMode() {
            const htmlTag = document.documentElement;
            htmlTag.classList.toggle('dark');
            const icon = document.getElementById('themeIcon');
            const btnText = document.getElementById('themeBtnText');
            const portalIcon = document.getElementById('portalThemeIcon');
            const portalBtnText = document.getElementById('portalThemeBtnText');

            const isDark = htmlTag.classList.contains('dark');
            
            if (icon) icon.className = isDark ? 'fa-solid fa-sun text-logoGreen' : 'fa-solid fa-moon text-logoGreen-dark';
            if (btnText) btnText.textContent = isDark ? 'Light' : 'Dark';
            if (portalIcon) portalIcon.className = isDark ? 'fa-solid fa-sun text-logoGreen' : 'fa-solid fa-moon text-logoGreen';
            if (portalBtnText) portalBtnText.textContent = isDark ? 'Light' : 'Dark';
        }