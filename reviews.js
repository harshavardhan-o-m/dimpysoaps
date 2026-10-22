
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://qjjntjekoxydnjkmharl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jswYtFZ9UzUtegz2rk-aiQ_K9T2umDP";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const form = document.getElementById("review-form");
const message = document.getElementById("review-message");
const list = document.getElementById("reviews-list");

async function loadReviews() {
    list.textContent = "Loading reviews...";

    const { data, error } = await supabase
        .from("reviews")
        .select("id, customer_name, rating, review_text, created_at")
        .eq("approved", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Loading reviews failed:", error);
        list.textContent = "Reviews are temporarily unavailable.";
        return;
    }

    list.replaceChildren();

    if (data.length === 0) {
        list.textContent = "No reviews yet. Be the first to share your experience!";
        return;
    }

    data.forEach(review => {
        const card = document.createElement("article");
        card.className = "review-card";

        const header = document.createElement("div");
        header.className = "review-card-header";

        const name = document.createElement("h3");
        name.className = "review-customer";
        name.textContent = review.customer_name;

        const badge = document.createElement("span");
        badge.className = "review-verified";
        badge.textContent = "Customer review";

        const stars = document.createElement("div");
        stars.className = "review-stars";
        stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement("span");
            star.textContent = i <= review.rating ? "★" : "☆";
            if (i <= review.rating) {
                star.className = "star-filled";
            }
            stars.appendChild(star);
        }

        const text = document.createElement("p");
        text.className = "review-text";
        text.textContent = review.review_text;

        const date = document.createElement("time");
        date.className = "review-date";
        date.dateTime = review.created_at;
        date.textContent = new Date(review.created_at).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short", year: "numeric" }
        );

        header.append(name, badge);
        card.append(header, stars, text, date);
        list.appendChild(card);
    });
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const customer_name = document.getElementById("customer-name").value.trim();
    const rating = Number(document.getElementById("review-rating").value);
    const review_text = document.getElementById("review-text").value.trim();
    const button = form.querySelector('button[type="submit"]');

    if (!customer_name || review_text.length < 5 || rating < 1 || rating > 5) {
        message.textContent = "Please enter your name, choose a rating, and write at least 5 characters.";
        return;
    }

    button.disabled = true;
    message.className = "review-message";
    message.textContent = "Submitting your review...";

    try {
        const { error } = await supabase
            .from("reviews")
            .insert([{ customer_name, rating, review_text }]);

        if (error) {
            console.error("Submitting review failed:", error);
            message.classList.add("review-error");
            message.textContent = "We couldn't submit your review. Please try again.";
            return;
        }

        form.reset();
        message.classList.add("review-success");
        message.textContent = "Thank you for sharing your experience!";

        await loadReviews();
    } catch (error) {
        console.error("Review submission error:", error);
        message.classList.add("review-error");
        message.textContent = "Connection problem. Please try again.";
    } finally {
        button.disabled = false;
    }
});

loadReviews();
