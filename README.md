# ClickClack - typing test

#### Members
- Jesse Mckenzie
- Alex Deschenes
- Caleb Chiang
- Abdulqadir Abuharrus

## Idea
We were inspired by MonkeyType, which is a typing speed test app. Our implementation will utilize AI to create story texts that the user will type out while we track their metrics and update the UI in real time.
We also have some non-core ideas listed below:
- Hardware idea: Play music and the faster the user the louder the music. (undecided).
## Tech Stack
- NextJS frontend
- ExpressJS backend
- PostgreSQL database on Supabase to store user and prompt data.
- Frontend hosting on Vercel, and backend on Seenode (temporary).
## Workflow
1. User signs up or logs into their account.
2. Redirected to the main page (containing previous attempts?).
3. Choose difficulty (easy, medium, hard, expert) and the theme (enter as text?).
4. Prompt AND await the AI for the text.
    - Display some loading animation…
    - Handle any errors
    - Consider storing the returned text in DB? With theme and difficulty, and userID. This way we can retrieve a stored text if AI fails to deliver…
5. Display the text and update the UI for the user.
6. Start the timer when user starts typing and start logging metrics
7. When timer runs out
    - Stop game.
    - Compute metrics.
    - Update DB where necessary.
    - Display results for user
If user types all the given text, repeat the text (shouldn’t happen)
8. Prompt user for another run.

