<?php
if (!defined('ABSPATH')) {
  exit();
}

function remove_uip_licence_key()
{
  $options = get_option('uip-global-settings');
  $data = [];
  if (isset($options['uip_pro'])) {
    $data = $options['uip_pro'];
  }

  if (isset($data['key']) && isset($data['instance'])) {
    $key = $data['key'];
    $instance = $data['instance'];
    $remoteURL = "https://api.lemonsqueezy.com/v1/licenses/deactivate?license_key={$key}&instance_id={$instance}";

    $remote = wp_remote_post($remoteURL, [
      'timeout' => 10,
      'headers' => [
        'Accept' => 'application/json',
      ],
    ]);
  }

  $options['uip_pro'] = false;
  update_option('uip-global-settings', $options);
}
register_uninstall_hook(uip_pro_plugin_path_name . '/uipress-pro.php', 'remove_uip_licence_key');

class uipress_pro_compiler
{
  /**
   * Loads UiPress Classes and plugins
   * @since 3.0.0
   */

  public function run()
  {
    //Uipress lite is not installed
    if (!class_exists('uip_site_settings')) {
      add_action('admin_head', [$this, 'flag_uipress_lite_error']);
      return;
    }

    /**
     * Checks version of uipress. If we are on the newer version then we should load a new version of uipress-pro
     */
    if (!function_exists('get_plugins')) {
      require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    $all_plugins = get_plugins();

    $plugin_slug = 'uipress-lite/uipress-lite.php'; // Replace with the actual plugin file.

    if (isset($all_plugins[$plugin_slug]) && $all_plugins[$plugin_slug]['Version']) {
      $plugin_version = $all_plugins[$plugin_slug]['Version'];
      $plugin_version = floatval($plugin_version);
      if ($plugin_version >= 3.3) {
        require_once uip_pro_plugin_path . 'uipresspro/admin/compiler.php';
        $compiler = new uipress_pro_compiler_new();
        $compiler->run();

        $this->load_plugin_textdomain();
        $this->activations_hooks();
        return;
      }
    }

    require_once uip_pro_plugin_path . 'admin/classes/uip-pro-app.php';
    require_once uip_pro_plugin_path . 'admin/classes/uip-pro-ajax.php';
    require_once uip_pro_plugin_path . 'admin/classes/uip-update.php';
    require_once uip_pro_plugin_path . 'admin/classes/uip-pro-site-settings.php';

    //LOAD UIPRESS APP
    $uip_app = new uip_pro_app();
    $uip_app->run();
    //LOAD UIPRESS AJAX FUNCTIONS
    $uip_ajax = new uip_pro_ajax();
    $uip_ajax->load_ajax();
    //LOAD UPDATER
    $uip_update = new uip_pro_update();
    $uip_update->run();
    //LOAD UPDATER
    $uip_site_settings = new uip_pro_site_settings();
    $uip_site_settings->run();

    $this->load_plugin_textdomain();
    $this->activations_hooks();
  }

  /**
   * Checks if safe mode key has been set and if it has ben added to current page
   * @since 3.0.0
   */
  public function checkForSafeMode()
  {
    if (defined('uip_safe_mode_key')) {
      if (isset($_GET['uipsm']) && $_GET['uipsm'] == uip_safe_mode) {
        return true;
      }
    }
  }

  /**
   * Outputs error if no uipress
   * @since 1.0
   */
  public function flag_uipress_lite_error()
  {
    $class = 'notice notice-error';
    $message = __('uiPress Pro requires UiPress lite to be installed before activating. uiPress lite can be downloaded from the WordPress repository', 'uipress-pro');
    $link = __('here', 'uipress-pro');

    printf('<div class="%1$s"><p>%2$s <a href="https://wordpress.org/plugins/uipress-lite/" target="_BLANK">%3$s</a></p></div>', esc_attr($class), esc_html($message), esc_html($link));
  }

  /**
   * Adds hooks for activation and deactivation of uipress
   * @since 3.0.0
   */
  public function activations_hooks()
  {
    //register_activation_hook(uip_plugin_path_name . '/uipress-lite.php', [$this, 'add_required_caps']);
  }

  /**
   * Removes licence key from db and activation from account
   * @since 3.0.0
   */
  public function remove_licence_key()
  {
    $options = get_option('uip-global-settings');
    $data = [];
    if (isset($options['uip_pro'])) {
      $data = $options['uip_pro'];
    }

    if (isset($data['key']) && isset($data['instance'])) {
      $key = $data['key'];
      $instance = $data['instance'];
      $remoteURL = "https://api.lemonsqueezy.com/v1/licenses/deactivate?license_key={$key}&instance_id={$instance}";

      $remote = wp_remote_post($remoteURL, [
        'timeout' => 10,
        'headers' => [
          'Accept' => 'application/json',
        ],
      ]);
    }

    $options['uip_pro'] = false;
    update_option('uip-global-settings', $options);
  }

  /**
   * translation files action
   * @since 1.4
   */
  public function load_plugin_textdomain()
  {
    add_action('plugins_loaded', [$this, 'uipress_languages_loader']);
  }

  /**
   * Loads translation files
   * @since 1.4
   */
  public function uipress_languages_loader()
  {
    load_plugin_textdomain('uipress-pro', false, dirname(dirname(plugin_basename(__FILE__))) . '/languages');
  }
}

?>
