import { cookies } from 'next/headers';
import useSupabase from '@/hooks/use-supabase';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const supabase = useSupabase();
        const cookieStore = cookies();
        const inputObj = await request.json();
        const lexiconToken = cookieStore.get('lexiconToken');

        if (!inputObj.word) {
            throw new Error('Invalid input object');
        }

        if (!lexiconToken || !lexiconToken.value) {
            return new Response('Unauthorized', { status: 401 });
        }

        const jwtToken = jwt.verify(lexiconToken.value, process.env.JWT_SECRET!) as { email: string };

        if (!jwtToken) {
            throw new Error('Invalid token');
        }

        const { email } = jwtToken;

        // check if logged in
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData?.user || userData.user.id !== process.env.THUCNE_ID!) {
            await supabase.auth.signInWithPassword({
                email: 'trongthuc.bentre@gmail.com',
                password: process.env.THUCNE_PASS!
            });
        }

        // find favorite lexicon where createdBy = email and lexicon = inputObj.word
        const { data: found } = await supabase
            .from('FavoriteLexicon')
            .select()
            .eq('createdBy', email)
            .eq('lexicon', inputObj.word)
            .single();

        if (found) {
            // remove from favorite
            await supabase.from('FavoriteLexicon').delete().eq('id', found.id);
        } else {
            // save
            const { data, error } = await supabase
                .from('FavoriteLexicon')
                .insert({ lexicon: inputObj.word, createdBy: email });
            console.log(data, error);
        }

        const nextState = !Boolean(found);

        return new Response(JSON.stringify({ currentState: nextState }));
    } catch (error) {
        return new Response('Error saving favorite lexicons');
    }
}
