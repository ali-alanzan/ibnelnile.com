<?php
use UipressPro\Classes\Ajax\AjaxFunctions;
use UipressPro\Classes\uipApp\PluginUpdate;
use UipressPro\Classes\uipApp\SiteSettings;
use UipressPro\Classes\uiBuilder\uipProApp;

// Exit if accessed directly
!defined("ABSPATH") ? exit() : "";

class uipress_pro_compiler_new
{
  /**
   * Loads UiPress pro Classes and plugins
   *
   * @since 3.0.0
   */
  public function run()
  {
    require uip_pro_plugin_path . 'uipresspro/admin/vendor/autoload.php';
    add_action('uipress/uibuilder/start', ['UipressPro\Classes\uiBuilder\uipProApp', 'start']);

    AjaxFunctions::start();

    // Mount plugin updater
    PluginUpdate::mount();

    // Mount site settings
    SiteSettings::start();
  }
}
