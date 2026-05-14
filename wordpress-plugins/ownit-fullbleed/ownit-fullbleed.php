<?php
/**
 * Plugin Name:       Own It Full Bleed
 * Description:       Full viewport width section with background color or image and inner blocks.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Own It
 * License:           GPL-2.0-or-later
 * Text Domain:       ownit-fullbleed
 *
 * @package OwnIt_FullBleed
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 */
function ownit_fullbleed_init(): void
{
    register_block_type(__DIR__);
}

add_action('init', 'ownit_fullbleed_init');
