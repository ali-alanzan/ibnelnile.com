<?php
/**
 * Enqueue script and styles for child theme
 */
function woodmart_child_enqueue_styles() {
	wp_enqueue_style( 'child-style', get_stylesheet_directory_uri() . '/style.css', array( 'woodmart-style' ), woodmart_get_theme_info( 'Version' ) );
}
add_action( 'wp_enqueue_scripts', 'woodmart_child_enqueue_styles', 10010 );
// تعطيل إشعارات تحديث نواة ووردبريس
add_filter('pre_site_transient_update_core', '__return_null');

// تعطيل إشعارات تحديث الإضافات
add_filter('pre_site_transient_update_plugins', '__return_null');

// تعطيل إشعارات تحديث القوالب
add_filter('pre_site_transient_update_themes', '__return_null');

// إخفاء تنبيه التحديث العلوي من لوحة التحكم
add_action('admin_menu', function() {
    remove_action('admin_notices', 'update_nag', 3);
});
// إخفاء كل الإشعارات من لوحة تحكم ووردبريس
add_action('admin_init', function () {
    remove_all_actions('admin_notices');
    remove_all_actions('all_admin_notices');
});










// 1. Enqueue WooCommerce Select2 for the Metabox
add_action('admin_enqueue_scripts', function($hook) {
    if ($hook == 'post.php' || $hook == 'post-new.php') {
        // Enqueue Select2 provided by WooCommerce
        wp_enqueue_script('wc-enhanced-select');
        wp_enqueue_style('woocommerce_admin_styles', WC()->plugin_url() . '/assets/css/admin.css');
    }
});

// 2. Register the Metabox
add_action('add_meta_boxes', function() {
    add_meta_box(
        'product_offer_metabox',
        'Product Offer Selection',
        'render_product_offer_metabox',
        'post',
        'side',
        'high'
    );
});

// 3. Render the HTML for the Metabox
function render_product_offer_metabox($post) {
    $selected_id = get_post_meta($post->ID, '_selected_product_id', true);
    $products = wc_get_products(array('limit' => -1, 'status' => 'publish'));
    
    wp_nonce_field('save_product_offer', 'product_offer_nonce');
    ?>
    <select id="product_search_select" name="selected_product_id" class="wc-product-search" style="width:100%;">
        <option value="">-- Search for a Product --</option>
        <?php foreach ($products as $product) : ?>
            <option value="<?php echo $product->get_id(); ?>" <?php selected($selected_id, $product->get_id()); ?>>
                <?php echo $product->get_name(); ?> (#<?php echo $product->get_id(); ?>)
            </option>
        <?php endforeach; ?>
    </select>

    <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Initialize Select2 on the dropdown
            $('#product_search_select').select2({
                placeholder: "Search for a product...",
                allowClear: true
            });
        });
    </script>
    <p class="description" style="margin-top:10px;">Select a product to sync its sale price to the REST API.</p>
    <?php
}

// 4. Save the Selection
add_action('save_post', function($post_id) {
    if (!isset($_POST['product_offer_nonce']) || !wp_verify_nonce($_POST['product_offer_nonce'], 'save_product_offer')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    
    if (isset($_POST['selected_product_id'])) {
        update_post_meta($post_id, '_selected_product_id', sanitize_text_field($_POST['selected_product_id']));
    }
});


add_action('rest_api_init', function () {
    register_rest_field('post', 'product_offer_details', array(
        'get_callback' => function ($post_array) {
            $product_id = get_post_meta($post_array['id'], '_selected_product_id', true);

            if ($product_id) {
                $product = wc_get_product($product_id);
                if ($product) {
                    return array(
                        'sale_price' => $product->get_sale_price(),
                        'regular_price' => $product->get_regular_price(),
                        // Returns timestamps converted to Y-m-d format
                        'date_from'  => $product->get_date_on_sale_from() ? $product->get_date_on_sale_from()->date('Y-m-d') : null,
                        'date_to'    => $product->get_date_on_sale_to() ? $product->get_date_on_sale_to()->date('Y-m-d') : null,
                        'is_on_sale' => $product->is_on_sale(),
                    );
                }
            }
            return null;
        }
    ));
});



add_action('rest_api_init', function () {
    register_rest_route('api/v1', '/branches', [
        'methods' => 'GET',
        'callback' => 'get_all_branches',
        'permission_callback' => '__return_true',
    ]);
});

function get_all_branches() {
    $branches = get_posts([
        'post_type'   => 'branch',
        'numberposts' => -1,
        'post_status' => 'publish'
    ]);

    if (empty($branches)) {
        return new WP_Error('no_branches', 'No branches found', ['status' => 404]);
    }

    $data = [];
    foreach ($branches as $branch) {
        $data[] = [
            'id'    => $branch->ID,
            'title' => $branch->post_title,
            // Add custom meta if needed, e.g., 'address' => get_post_meta($branch->ID, 'address', true),
        ];
    }

    return rest_ensure_response($data);
}

add_action('woocommerce_new_order', 'save_branch_id_to_order', 10, 2);

function save_branch_id_to_order($order_id, $order) {
    // Get the raw POST data from the request body
    $json_data = file_get_contents('php://input');
    $params = json_decode($json_data, true);

    // Check if branch_id exists in the incoming JSON request
    if (isset($params['branch_id'])) {
        $branch_id = sanitize_text_field($params['branch_id']);
        
        // Update the order meta with the branch ID
        update_post_meta($order_id, '_selected_branch_id', get_the_title($branch_id) . " (#{$branch_id}) ");
    }
}











