<?php
/*
Plugin Name: Auto Form Fill
Plugin URI:
Description: Automatically fill up forms with your desired values.
Version: 1.0.0
Author: Md. Joynal Abedin Parag
Author URI:
License: GPL2
*/
?>

<?php
add_action( 'admin_menu', 'smartFormFill_add_admin_menu' );
add_action( 'admin_init', 'smartFormFill_settings_init' );
register_uninstall_hook( __FILE__, 'smartFormFill_remove_settings' );

function smartFormFill_add_admin_menu() {
	add_menu_page( 'smartFormFill', 'Auto Form Fill', 'manage_options', 'autoFormFill', 'smartFormFill_options_page' );
}

function smartFormFill_remove_settings () {
	delete_option( 'smartFormFill_settings' );
}

function smartFormFill_settings_init() {

	register_setting( 'pluginPage', 'smartFormFill_settings' );

	add_settings_section(
		'smartFormFill_pluginPage_section',
		__( 'Save your preferences', 'smartFormFill' ),
		'smartFormFill_settings_section_callback',
		'pluginPage'
	);

	add_settings_field(
		'email_postfix',
		__( 'Email Postfix', 'smartFormFill' ),
		'sff_email_postfix_render',
		'pluginPage',
		'smartFormFill_pluginPage_section'
	);

	add_settings_field(
		'people_names',
		__( 'People Names', 'smartFormFill' ),
		'sff_people_names_render',
		'pluginPage',
		'smartFormFill_pluginPage_section'
	);

	add_settings_field(
		'phone_numbers',
		__( 'Phone Numbers', 'smartFormFill' ),
		'sff_phone_numbers_render',
		'pluginPage',
		'smartFormFill_pluginPage_section'
	);

	$smartfill_options = get_option( 'smartFormFill_settings' );
	// unset($smartfill_options[$ignore]);
	if(!empty($smartfill_options)) {
		foreach ( $smartfill_options as $so_key => $so_value ) {
			add_settings_field(
				$so_key,
				__( $so_key, 'smartFormFill' ),
				'sff_' . $so_key . '_render',
				'pluginPage',
				'smartFormFill_pluginPage_section'
			);
		}
	}
}

$smartfill_options = get_option( 'smartFormFill_settings' );

if(!empty($smartfill_options)) {
	foreach($smartfill_options as $so_key => $so_value) {
		$ignore = array('email_postfix', 'people_names', 'phone_numbers');
		if(!in_array($so_key, $ignore)) {
			$options = get_option( 'smartFormFill_settings' );
			$value = $options[$so_key];
			$input = 'echo "<textarea type=\'text\' name=\'smartFormFill_settings['.$so_key.']\'>'.$value.'</textarea>"';
			$fstring = "function sff_" . $so_key . "_render() {
							$input ?>
							<a href='javascript:void(0)' class='smartfill-field-remove-btn'>delete</a>
							<?php }";
			if (!function_exists("sff_" . $so_key . "_render")) {
				eval( $fstring );
			}
		}
	}
}

function sff_email_postfix_render() {
	$options = get_option( 'smartFormFill_settings' );
	?>
    <textarea type='text' name='smartFormFill_settings[email_postfix]' value=''><?php echo $options['email_postfix'];?></textarea>
	<?php
}

function sff_people_names_render() {
	$options = get_option( 'smartFormFill_settings' );
	?>
	<textarea type='text' name='smartFormFill_settings[people_names]' value=''><?php echo $options['people_names'];?></textarea>
	<?php
}
function sff_phone_numbers_render() {
	$options = get_option( 'smartFormFill_settings' );
	?>
	<textarea type='text' name='smartFormFill_settings[phone_numbers]' value=''><?php echo $options['phone_numbers'];?></textarea>
	<?php
}

function smartFormFill_settings_section_callback() {
    echo __( 'Please use `field names, id or class` of your form fields to save your preferencese.<br /> You can set multiple values separated by comma(,).', 'smartFormFill' );
}


function smartFormFill_options_page() {
	$options = get_option( 'smartFormFill_settings' );
	?>
	<form id="smartfill-option-form" action='options.php' method='post'>

		<?php
		settings_fields( 'pluginPage' );
		do_settings_sections( 'pluginPage' );
		?>
        <a href="javascript:void(0)" id="smartfill-add-field">Add Field</a>
        <div id="smartfill-add-form">
            <label> Field Name </label>
            <input type="text" id="smartfill-add-field-identifier">
            <input type="button" id="smartfill-add-form-add-field-submit-btn" class="button button-primary" value="Add">
        </div>
        <?php
		submit_button();
		?>

	</form>
	<?php

}

function smartFormFill_get_settings() {
	$smartFormFill_options = get_option( 'smartFormFill_settings' );
	echo json_encode($smartFormFill_options);
	exit;
}

/*function public_scripts(){
	wp_enqueue_script( 'jquery' );
	if(!is_admin()) {
		wp_register_script( 'autofill', plugin_dir_url( __FILE__ ) . 'js/autofill.form.js', array( 'jquery' ), '1.0', true );
		wp_enqueue_script( 'autofill' );
	}
}

function admin_scripts() {

	wp_register_script( 'autofill-manage', plugin_dir_url( __FILE__ ) . 'js/autofill-manage.js', array( 'jquery' ), '1.0', true );
	wp_enqueue_script( 'autofill-manage' );

	wp_enqueue_style( 'smartfill-style', plugin_dir_url( __FILE__ ) . 'css/smartfill-style.css' );
}

add_action( 'wp_enqueue_scripts', 'public_scripts' );
add_action( 'admin_enqueue_scripts', 'admin_scripts' );*/

add_action( 'wp_ajax_smartFormFill_get_settings', 'smartFormFill_get_settings' );
add_action( 'wp_ajax_nopriv_smartFormFill_get_settings', 'smartFormFill_get_settings' );


add_action( 'init', 'autofill_script_enqueuer' );
function autofill_script_enqueuer() {
	wp_enqueue_style( 'smartfill-style', plugin_dir_url( __FILE__ ) . 'css/smartfill-style.css' );

	wp_register_script( 'autofill', plugin_dir_url( __FILE__ ) . 'js/autofill.form.js', array( 'jquery' ), '1.0', true );
	wp_register_script( 'autofill-manage', plugin_dir_url( __FILE__ ) . 'js/autofill-manage.js', array( 'jquery' ), '1.0', true );

	wp_localize_script( 'autofill', 'autofill', array( 'ajaxurl' => admin_url( 'admin-ajax.php' )));
	wp_localize_script( 'autofill-manage', 'autofill_manage', array( 'ajaxurl' => admin_url( 'admin-ajax.php' )));

	wp_enqueue_script( 'jquery' );
	wp_enqueue_script( 'autofill' );
	wp_enqueue_script( 'autofill-manage' );
}
?>


