<?php
/**
 * Plugin Name: App Backend System
 * Description: Handles offers, wallet, product recommendation, coverage check, order routing and reward points.
 * Version: 1.0
 * Author: Ali Alanzan, Qeema Tech Team.
 */

if (!defined('ABSPATH')) exit;

class App_Backend_System {

    public function __construct() {

        add_action('rest_api_init', [$this,'register_routes']);
        add_action('admin_menu', [$this,'admin_menu']);
        add_action('init', [$this,'register_branch_post_type']);
    }

    public function register_branch_post_type(){
    
        register_post_type('branch',[
            'label'=>'Branches',
            'public'=>false,
            'show_ui'=>true,
            'menu_icon'=>'dashicons-store',
            'supports'=>['title']
        ]);
        
        add_action('add_meta_boxes', function(){
        
            add_meta_box(
                'branch_location',
                'Branch Location',
                function($post){
        
                    $lat = get_post_meta($post->ID,'lat',true);
                    $lng = get_post_meta($post->ID,'lng',true);
        
                    echo 'Lat <input name="lat" value="'.$lat.'"><br><br>';
                    echo 'Lng <input name="lng" value="'.$lng.'">';
        
                },
                'branch'
            );
        
        });
        
        add_action('save_post_branch', function($post_id){
        
            if(isset($_POST['lat']))
                update_post_meta($post_id,'lat',$_POST['lat']);
        
            if(isset($_POST['lng']))
                update_post_meta($post_id,'lng',$_POST['lng']);
        
        });
    }

    public function wallets_page(){
    
        if(isset($_POST['save_wallet'])){
    
            $user_id = intval($_POST['user_id']);
            $balance = floatval($_POST['wallet_balance']);
    
            update_user_meta($user_id,'wallet_balance',$balance);
    
            echo '<div class="updated"><p>Wallet updated successfully</p></div>';
        }
    
        $users = get_users();
    
        echo '<div class="wrap"><h1>User Wallets</h1>';
    
        echo '<table class="widefat striped">';
        echo '<thead>
                <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Balance</th>
                    <th>Action</th>
                </tr>
              </thead>';
    
        foreach($users as $user){
    
            $balance = get_user_meta($user->ID,'wallet_balance',true);
    
            if($balance == '') $balance = 0;
    
            echo '<tr>';
    
            echo '<form method="post">';
    
            echo '<td>'.$user->display_name.'</td>';
    
            echo '<td>'.$user->user_email.'</td>';
    
            echo '<td>
                    <input 
                        type="number" 
                        step="0.01"
                        name="wallet_balance" 
                        value="'.$balance.'" 
                        style="width:120px"
                    >
                  </td>';
    
            echo '<td>
                    <input type="hidden" name="user_id" value="'.$user->ID.'">
                    <button class="button button-primary" name="save_wallet">
                        Save
                    </button>
                  </td>';
    
            echo '</form>';
    
            echo '</tr>';
        }
    
        echo '</table>';
    
        echo '</div>';
    }

    public function admin_menu(){
    
        add_menu_page(
            'App Backend',
            'App Backend',
            'manage_options',
            'app-backend',
            [$this,'dashboard_page'],
            'dashicons-admin-generic',
            26
        );
    
        add_submenu_page(
            'app-backend',
            'Offers',
            'Offers',
            'manage_options',
            'app-offers',
            [$this,'offers_page']
        );
    
        add_submenu_page(
            'app-backend',
            'Branches',
            'Branches',
            'manage_options',
            'app-branches',
            [$this,'branches_page']
        );
    
        add_submenu_page(
            'app-backend',
            'Wallets',
            'Wallets',
            'manage_options',
            'app-wallets',
            [$this,'wallets_page']
        );
    
    }
    
    
    public function branches_page(){
    
        if(isset($_POST['save_branch'])){
    
            $post_id = intval($_POST['branch_id']);
    
            update_post_meta($post_id,'lat',sanitize_text_field($_POST['lat']));
            update_post_meta($post_id,'lng',sanitize_text_field($_POST['lng']));
    
            echo '<div class="updated"><p>Branch updated successfully</p></div>';
        }
    
        if(isset($_POST['add_branch'])){
    
            $branch_id = wp_insert_post([
                'post_type' => 'branch',
                'post_title' => sanitize_text_field($_POST['branch_name']),
                'post_status' => 'publish'
            ]);
    
            update_post_meta($branch_id,'lat',sanitize_text_field($_POST['lat']));
            update_post_meta($branch_id,'lng',sanitize_text_field($_POST['lng']));
    
            echo '<div class="updated"><p>Branch added successfully</p></div>';
        }
    
        if(isset($_GET['delete_branch'])){
    
            wp_delete_post(intval($_GET['delete_branch']), true);
    
            echo '<div class="updated"><p>Branch deleted</p></div>';
        }
    
        $branches = get_posts([
            'post_type' => 'branch',
            'numberposts' => -1
        ]);
    
        echo '<div class="wrap">';
        echo '<h1>Branches</h1>';
    
        /*
        =====================
        ADD NEW BRANCH
        =====================
        */
    
        echo '<h2>Add New Branch</h2>';
    
        echo '<form method="post" style="margin-bottom:30px;">';
    
        echo '<input type="text" name="branch_name" placeholder="Branch Name" required> ';
        echo '<input type="text" name="lat" placeholder="Latitude" required> ';
        echo '<input type="text" name="lng" placeholder="Longitude" required> ';
    
        echo '<button class="button button-primary" name="add_branch">Add Branch</button>';
    
        echo '</form>';
    
        /*
        =====================
        BRANCHES TABLE
        =====================
        */
    
        echo '<table class="widefat striped">';
        echo '<thead>
                <tr>
                    <th>ID</th>
                    <th>Branch</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Actions</th>
                </tr>
              </thead>';
    
        foreach($branches as $branch){
    
            $lat = get_post_meta($branch->ID,'lat',true);
            $lng = get_post_meta($branch->ID,'lng',true);
    
            echo '<tr>';
    
            echo '<form method="post">';
    
            echo '<td>'.$branch->ID.'</td>';
    
            echo '<td>'.$branch->post_title.'</td>';
    
            echo '<td>
                    <input type="text" name="lat" value="'.$lat.'" style="width:120px">
                  </td>';
    
            echo '<td>
                    <input type="text" name="lng" value="'.$lng.'" style="width:120px">
                  </td>';
    
            echo '<td>
                    <input type="hidden" name="branch_id" value="'.$branch->ID.'">
    
                    <button class="button button-primary" name="save_branch">Update</button>
    
                    <a class="button button-secondary"
                       href="?page=app-branches&delete_branch='.$branch->ID.'"
                       onclick="return confirm(\'Delete this branch?\')">
                       Delete
                    </a>
                  </td>';
    
            echo '</form>';
    
            echo '</tr>';
    
        }
    
        echo '</table>';
    
        echo '</div>';
    }
    
    

    
    public function dashboard_page(){
    
        echo '<div class="wrap">';
        echo '<h1>App Backend System</h1>';
        echo '<p>Manage mobile app backend features.</p>';
        echo '</div>';
    
    }

    public function offers_page(){
    
        if(isset($_POST['save_offer'])){
    
            update_post_meta($_POST['product_id'],'offer_active',1);
            update_post_meta($_POST['product_id'],'offer_counter',$_POST['offer_counter']);
    
            echo '<div class="updated"><p>Offer saved</p></div>';
        }
    
        $products = wc_get_products(['limit'=>-1]);
    
        echo '<div class="wrap"><h1>Offers</h1>';
    
        echo '<table class="widefat">';
        echo '<tr>
                <th>Product</th>
                <th>Counter</th>
                <th>Action</th>
              </tr>';
    
        foreach($products as $product){
    
            $counter = get_post_meta($product->get_id(),'offer_counter',true);
    
            echo '<tr>';
    
            echo '<form method="post">';
    
            echo '<td>'.$product->get_name().'</td>';
    
            echo '<td>
            <input type="number" name="offer_counter" value="'.$counter.'">
            </td>';
    
            echo '<td>
            <input type="hidden" name="product_id" value="'.$product->get_id().'">
            <button class="button button-primary" name="save_offer">Save</button>
            </td>';
    
            echo '</form>';
    
            echo '</tr>';
    
        }
    
        echo '</table></div>';
    }

    
    
    
    
    

    public function register_routes(){

        register_rest_route('app/v1','/offers',[
            'methods'=>'GET',
            'callback'=>[$this,'get_offers']
        ]);

        register_rest_route('app/v1','/share',[
            'methods'=>'POST',
            'callback'=>[$this,'share_app_reward']
        ]);

        register_rest_route('app/v1','/similar-products',[
            'methods'=>'GET',
            'callback'=>[$this,'similar_products']
        ]);

        register_rest_route('app/v1','/coverage',[
            'methods'=>'GET',
            'callback'=>[$this,'check_coverage']
        ]);

        register_rest_route('app/v1','/confirm-location',[
            'methods'=>'POST',
            'callback'=>[$this,'confirm_location']
        ]);

        register_rest_route('app/v1','/route-order',[
            'methods'=>'POST',
            'callback'=>[$this,'route_order']
        ]);

        register_rest_route('app/v1','/wallet',[
            'methods'=>'GET',
            'callback'=>[$this,'get_wallet']
        ]);

        register_rest_route('app/v1','/wallet/add',[
            'methods'=>'POST',
            'callback'=>[$this,'add_wallet']
        ]);

    }

    /*
    ===================================
    1. OFFERS + PRODUCT COUNTER
    ===================================
    */

    public function get_offers(){

        $offers = [];

        $products = wc_get_products([
            'limit'=>-1,
            'meta_key'=>'offer_active',
            'meta_value'=>1
        ]);

        foreach($products as $product){

            $offers[] = [
                'id'=>$product->get_id(),
                'name'=>$product->get_name(),
                'price'=>$product->get_price(),
                'sale_price'=>$product->get_sale_price(),
                'counter'=>get_post_meta($product->get_id(),'offer_counter',true),
                'image'=>wp_get_attachment_url($product->get_image_id())
            ];
        }

        return $offers;
    }

    /*
    ===================================
    2. SHARE APP + REWARD POINTS
    ===================================
    */

    public function share_app_reward($request){

        $user_id = $request['user_id'];

        $points = (int)get_user_meta($user_id,'reward_points',true);

        $points += 10;

        update_user_meta($user_id,'reward_points',$points);

        return [
            'points'=>$points,
            'message'=>'Points added successfully'
        ];
    }

    /*
    ===================================
    3. SIMILAR PRODUCTS
    ===================================
    */

    public function similar_products($request){

        $product_id = $request['product_id'];

        $terms = wp_get_post_terms($product_id,'product_cat',['fields'=>'ids']);

        $args = [
            'post_type'=>'product',
            'posts_per_page'=>10,
            'post__not_in'=>[$product_id],
            'tax_query'=>[
                [
                    'taxonomy'=>'product_cat',
                    'field'=>'id',
                    'terms'=>$terms
                ]
            ]
        ];

        $query = new WP_Query($args);

        $data = [];

        foreach($query->posts as $p){

            $product = wc_get_product($p->ID);

            $data[] = [
                'id'=>$product->get_id(),
                'name'=>$product->get_name(),
                'price'=>$product->get_price(),
                'image'=>wp_get_attachment_url($product->get_image_id())
            ];
        }

        return $data;

    }

    /*
    ===================================
    4. COVERAGE AREA
    ===================================
    */

    public function check_coverage($request){

        $city = $request['city'];

        $allowed = ['القاهرة','الجيزة','cairo','giza'];

        if(in_array(strtolower($city),$allowed)){

            return [
                'coverage'=>true
            ];

        }

        return [
            'coverage'=>false
        ];

    }

    /*
    ===================================
    5. CONFIRM LOCATION
    ===================================
    */

    public function confirm_location($request){

        $lat = $request['lat'];
        $lng = $request['lng'];

        return [
            'lat'=>$lat,
            'lng'=>$lng,
            'confirmed'=>true
        ];

    }

    /*
    ===================================
    6. ORDER ROUTING TO BRANCHES
    ===================================
    */

    public function route_order($request){

        $lat = $request['lat'];
        $lng = $request['lng'];

        $branches = get_posts([
            'post_type'=>'branch',
            'numberposts'=>-1
        ]);

        $nearest = null;
        $distance = 999999;

        foreach($branches as $branch){

            $b_lat = get_post_meta($branch->ID,'lat',true);
            $b_lng = get_post_meta($branch->ID,'lng',true);

            $d = sqrt(pow($lat-$b_lat,2)+pow($lng-$b_lng,2));

            if($d < $distance){

                $distance = $d;
                $nearest = $branch;

            }

        }

        return [
            'branch_id'=>$nearest->ID,
            'branch_name'=>$nearest->post_title
        ];

    }

    /*
    ===================================
    7. CUSTOMER WALLET
    ===================================
    */

    public function get_wallet($request){

        $user_id = $request['user_id'];

        $balance = (float)get_user_meta($user_id,'wallet_balance',true);

        return [
            'balance'=>$balance
        ];
    }

    public function add_wallet($request){

        $user_id = $request['user_id'];
        $amount = $request['amount'];

        $balance = (float)get_user_meta($user_id,'wallet_balance',true);

        $balance += $amount;

        update_user_meta($user_id,'wallet_balance',$balance);

        return [
            'balance'=>$balance
        ];
    }

}

new App_Backend_System();