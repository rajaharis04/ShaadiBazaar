// ============================================================
// REVIEW CONTROLLER — Manage Product & Service Reviews
// ============================================================

const { supabaseAdmin } = require('../supabase');

// GET /api/reviews/:type/:id — Get reviews for a product or service
const getReviews = async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type !== 'product' && type !== 'service') {
      return res.status(400).json({ success: false, message: 'Invalid review type' });
    }

    const fkColumn = type === 'product' ? 'product_id' : 'service_id';

    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*, users(name)')
      .eq(fkColumn, id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews/:type/:id — Add review (authenticated)
const addReview = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (type !== 'product' && type !== 'service') {
      return res.status(400).json({ success: false, message: 'Invalid review type' });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const reviewData = {
      user_id: userId,
      rating: numericRating,
      comment: comment || ''
    };

    if (type === 'product') {
      reviewData.product_id = id;
    } else {
      reviewData.service_id = id;
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert([reviewData])
      .select('*, users(name)')
      .single();

    if (error) throw error;

    // Asynchronously recalculate average rating for service
    if (type === 'service') {
      try {
        const { data: allReviews } = await supabaseAdmin
          .from('reviews')
          .select('rating')
          .eq('service_id', id);

        if (allReviews && allReviews.length > 0) {
          const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = (total / allReviews.length).toFixed(1);

          await supabaseAdmin
            .from('services')
            .update({ rating: parseFloat(avgRating) })
            .eq('id', id);
        }
      } catch (ratingErr) {
        console.error('Failed to update service rating average:', ratingErr);
      }
    }

    res.status(201).json({ success: true, message: 'Review posted successfully!', review: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getReviews, addReview };
