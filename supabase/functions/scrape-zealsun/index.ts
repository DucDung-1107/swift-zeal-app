const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || !url.includes('zealsun.vn/products/')) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL zealsun.vn không hợp lệ' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Fetch failed: ${res.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await res.text();

    // Parse name from <h1>
    const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const name = nameMatch ? nameMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Parse SKU
    const skuMatch = html.match(/id="pro_sku"[^>]*>.*?<strong>(.*?)<\/strong>/is);
    const sku = skuMatch ? skuMatch[1].trim() : '';

    // Parse price - current price
    const priceMatch = html.match(/<span class="pro-price">([\d.,]+)₫<\/span>/i);
    const priceStr = priceMatch ? priceMatch[1].replace(/[.,]/g, '') : '0';
    const price = parseInt(priceStr) || 0;

    // Parse original price
    const origMatch = html.match(/<del>([\d.,]+)₫<\/del>/i);
    const origStr = origMatch ? origMatch[1].replace(/[.,]/g, '') : '';
    const original_price = origStr ? parseInt(origStr) || null : null;

    // Parse discount
    const discountMatch = html.match(/<span class="pro-percent">-([\d]+)%/i);
    const discount = discountMatch ? parseInt(discountMatch[1]) : null;

    // Parse brand
    const brandMatch = html.match(/pro-vendor.*?<strong>.*?>(.*?)<\/a>/is);
    const brand = brandMatch ? brandMatch[1].trim() : 'ZEALSUN';

    // Parse first image
    const imgMatch = html.match(/product-gallery__item[^>]*href="([^"]+)"/i);
    let image_url = imgMatch ? imgMatch[1].trim() : '';
    if (image_url.startsWith('//')) image_url = 'https:' + image_url;

    // Parse description from product tab content
    const descMatch = html.match(/class="product-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    let description = '';
    if (descMatch) {
      description = descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Slug from URL
    const slugMatch = url.match(/\/products\/([^/?#]+)/);
    const slug = slugMatch ? slugMatch[1] : '';

    // In stock check
    const inStock = html.includes('Còn hàng');

    return new Response(
      JSON.stringify({
        success: true,
        data: { name, sku, price, original_price, discount, brand, image_url, description, slug, in_stock: inStock },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
