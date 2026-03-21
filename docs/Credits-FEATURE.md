Esse documento foi feito em 3 partes os nomes sao Credits-BumpUp.md, Credits-FEATURE.md, Credits-Highlight YourListing.md tudo isso eh para voce trae para voce ter uma ideia de como eh e de como vamos fazer e cobrar sobre os anuncios se voce tiver duvida pergunte no chat mas leia tudo antes .

- Feature Aqui segue tudo o que peguei do Rubranking em relação essa modalidade esta mostrando o que aparece no front end e depois mostro o que consegui coletar do console
https://www.rubrankings.com/upgrade-listing/featured.html?id=50828

* Front end
Feature My Listing
Select a Package
Upgrade To Featured For 30 Days
$ 60
30 Days

Upgrade To Featured For 7 days
$ 20
7 Days *

* Source Cod

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <title>Feature My Listing</title>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="generator" content="Flynax Classifieds Software" />
<meta charset="UTF-8" />
<meta http-equiv="x-dns-prefetch-control" content="on" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="" />
<meta name="Keywords" content="" />
<meta property="og:image" content="https://www.rubrankings.com/templates/escort_nova/img/socialImage.webp">
<link rel="stylesheet" href="https://www.rubrankings.com/templates/escort_nova/css/dark.css?v=1757345315" />
<link rel="stylesheet" href="https://www.rubrankings.com/templates/escort_nova/css/bootstrap.css?v=1757345315" />
<link rel="stylesheet" href="https://www.rubrankings.com/templates/escort_nova/css/style.css?v=1757345315" />

<link rel="shortcut icon" href="https://www.rubrankings.com/templates/escort_nova/img/favicon.ico" type="image/x-icon" />
<link rel="canonical" href="https://www.rubrankings.com/upgrade-listing/featured.html" />


<!--[if lte IE 10]>
<meta http-equiv="refresh" content="0; url=https://www.rubrankings.com/templates/escort_nova/browser-upgrade.htx" />
<style>body { display: none!important; }</style>
<![endif]-->
<script  src="https://www.rubrankings.com/libs/jquery/jquery.js"></script>
<script  src="https://www.rubrankings.com/libs/javascript/system.lib.js"></script>
<script  src="https://www.rubrankings.com/libs/jquery/jquery.ui.js"  ></script>
<script  src="https://www.rubrankings.com/libs/jquery/datePicker/i18n/ui.datepicker-en.js" ></script>
    
                
<!-- Twitter Card data -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Feature My Listing">
<meta name="twitter:site" content="rubrankings">

<!-- Open Graph data -->
<meta property="og:title" content="Feature My Listing" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.rubrankings.com/upgrade-listing/featured.html?id=50828" />
<meta property="og:site_name" content="Orlando BodyRubs &amp; Massage Directory" />

<script type="text/javascript">
    var rlLangDir       = 'ltr';
    var rlLang          = 'en';
    var isLogin         = true;
    var staticDataClass = true;

    var lang = new Array();
        lang['delete_account'] = 'Remove Account';
        lang['error_maxFileSize'] = 'The file size exceeds the {limit}Mb limit.';
        lang['password_weak_warning'] = 'Your password is too weak, we suggest using uppercase characters to make it stronger.';
        lang['password_strength_pattern'] = 'Strength ({number} of {maximum})';
        lang['loading'] = 'Loading...';
        lang['flynax_connect_fail'] = 'Unable to reach Server.';
        lang['update'] = 'Update';
        lang['reviewed'] = 'Reviewed';
        lang['replied'] = 'Replied';
        lang['password_lenght_fail'] = 'Your password is either too short or empty.';
        lang['done'] = 'Done';
        lang['incomplete'] = 'Incomplete';
        lang['warning'] = 'Warning!';
        lang['pending'] = 'Pending';
        lang['expired'] = 'Expired';
        lang['system_error'] = 'A system error has occurred; please see the error log or contact helpdesk.';
        lang['confirm_notice'] = 'Please confirm the action.';
        lang['show_subcategories'] = 'Show Subcategories';
        lang['cancel'] = 'Cancel';
        lang['notice'] = 'Note';
        lang['save'] = 'Save';
        lang['close'] = 'Close';
        lang['characters_left'] = 'Characters left';
        lang['to'] = 'to';
        lang['any'] = '- Any -';
        lang['from'] = 'from';
        lang['password'] = 'Password';
        lang['delete_confirm'] = 'Are you sure you want to completely remove the item?';
        lang['manage'] = 'Manage';
        lang['delete'] = 'Delete';
        lang['notice_pass_bad'] = 'Passwords do not match.';
        lang['notice_reg_length'] = 'The value in the {field} field must be at least 3 characters long.';
        lang['notice_bad_file_ext'] = 'The {ext} file extension is incompatible; please consider using an extension from the list.';
        lang['active'] = 'Active';
        lang['approval'] = 'Inactive';
        lang['price'] = 'Price';
        lang['of'] = 'of';
        lang['add_to_favorites'] = 'Add to Favorites';
        lang['no_favorite'] = 'You don&rsquo;t have any Favorites.';
        lang['remove_from_favorites'] = 'Undo Favorite';
        lang['save_search_confirm'] = 'Are you sure you want to add an alert?';
        lang['no_browser_gps_support'] = 'Your browser doesn&rsquo;t support the Geolocation option.';
        lang['gps_support_denied'] = 'Please enable Geolocation detection in your browser settings.';
        lang['nothing_found_for_char'] = 'Nothing found for <b>&quot;{char}&quot;<\/b>';
        lang['canceled'] = 'Canceled';
        lang['count_more_pictures'] = '{count} pics<br />more';
        lang['delete_file'] = 'Delete File';
        lang['account_remove_notice_pass'] = 'Your account will be terminated permanently including your profile data, listings and other settings; please enter your password to proceed with termination.';
        lang['account_remove_notice'] = 'Your account will be terminated permanently including your profile data, listings and other settings.';
        lang['account_remove_in_process'] = 'The account removal is in process; please do not close the pop-up.';
        lang['field_autocomplete_no_results'] = 'Nothing found';
        lang['call_owner'] = 'Call Agency';
        lang['agency_invite_accepted'] = 'The invitation has been successfully accepted.';
        lang['accepted'] = 'Accepted';
        lang['declined'] = 'Declined';
        lang['call_owner_personal'] = 'Call {name}';
        lang['comment_add_comment'] = 'Add Comment';
        lang['mf_is_your_location'] = 'Is {location} your location?';
    
    var rlPageInfo           = new Array();
    rlPageInfo['key']        = 'upgrade_listing';
    rlPageInfo['controller'] = 'upgrade_listing';
    rlPageInfo['path']       = 'upgrade-listing';

    var rlConfig                                 = new Array();
    rlConfig['seo_url']                          = 'https://www.rubrankings.com/';
    rlConfig['tpl_base']                         = 'https://www.rubrankings.com/templates/escort_nova/';
    rlConfig['files_url']                        = 'https://www.rubrankings.com/files/';
    rlConfig['libs_url']                         = 'https://www.rubrankings.com/libs/';
    rlConfig['plugins_url']                      = 'https://www.rubrankings.com/plugins/';

    /**
     * @since 4.8.2 - Added "cors_url", "tpl_cors_base" variables
     */
    rlConfig['cors_url']                         = 'https://www.rubrankings.com';
        rlConfig['ajax_url']                         = rlConfig['cors_url'] + '/request.ajax.php';
    rlConfig['tpl_cors_base']                    = rlConfig['cors_url'] + '/templates/escort_nova/';
    rlConfig['mod_rewrite']                      = 1;
    rlConfig['sf_display_fields']                = 0;
    rlConfig['account_password_strength']        = 0;
    rlConfig['messages_length']                  = 250;
    rlConfig['pg_upload_thumbnail_width']        = 500;
    rlConfig['pg_upload_thumbnail_height']       = 500;
    rlConfig['thumbnails_x2']                    = false;
    rlConfig['template_type']                    = 'responsive_42';
    rlConfig['domain']                           = '.rubrankings.com';
    rlConfig['domain_path']                      = '/';
    rlConfig['isHttps']                          = true;
    rlConfig['map_search_listings_limit']        = 500;
    rlConfig['map_search_listings_limit_mobile'] = 75;
    rlConfig['price_delimiter']                  = ",";
    rlConfig['price_separator']                  = ".";
    rlConfig['random_block_slideshow_delay']     = '10';
    rlConfig['template_name']                    = 'escort_nova_wide';
    rlConfig['map_provider']                     = 'google';
    rlConfig['map_default_zoom']                 = '14';
    rlConfig['upload_max_size']                  = 2097152;
    rlConfig['expire_languages']                 = 12;

    var rlAccountInfo = new Array();
    rlAccountInfo['ID'] = 22266;

    flynax.langSelector();

    var qtip_style = new Object({
        width      : 'auto',
        background : '#FFAA53',
        color      : '#111111',
        tip        : 'bottomLeft',
        border     : {
            width  : 7,
            radius : 0,
            color  : '#FFAA53'
        }
    });
</script>

<script  defer src="https://www.rubrankings.com/templates/escort_nova/js/lib1.js" ></script>
<script  defer  src="https://www.rubrankings.com/templates/escort_nova/js/lib2.js" ></script>
<script  defer  src="https://www.rubrankings.com/templates/escort_nova/js/lib3.js" ></script>

<link href="https://www.rubrankings.com/plugins/rating/static/style.css" type="text/css" rel="stylesheet" /><!-- verification code plugin -->


<!-- verification code plugin --><!-- multifield header tpl -->


<script>

var mfGeoFields = new Array();

var gfAjaxClick = function(key, path, redirect){
    flUtil.ajax({
        mode: 'mfApplyLocation',
        item: path,
        key: key
    }, function(response, status) {
        if (status == 'success' && response.status == 'OK') {
            if (rlPageInfo['key'] === '404') {
                location.href = rlConfig['seo_url'];
            } else {
                if (location.href.indexOf('?reset_location') > 0) {
                    location.href = location.href.replace('?reset_location', '');
                } else {
                    if (redirect) {
                        location.href = redirect;
                    } else {
                        location.reload();
                    }
                }
            }
        } else {
            printMessage('error', lang['system_error']);
        }
    });
}


</script>

    <style>

/*** GEO LOCATION IN NAVBAR */
.circle #mf-location-selector{vertical-align:top;display:inline-block}#mf-location-selector+.popover{color:initial}#mf-location-selector .default:after,#mf-location-selector .default:before{display:none}#mf-location-selector .default>span{display:inline-block;min-width:0;text-overflow:ellipsis;white-space:nowrap}
#mf-location-selector .default {
    max-width: 170px;
    
        vertical-align: top;
        
    white-space: nowrap;
}



@media screen and (max-width: 767px) {
svg.mf-location-icon {
  display:none
}
    svg.mf-location-icon {
        margin: 0 !important;
    }
}
@media screen and (max-width: 576px) {
#mf-location-selector .default>span{
    font-size: 10px;
}
span.menu-button>svg{
        width: 14px;
    height: 14px;
}
span.menu-button{
        margin-left: 5px;
}
.custom-btn {
    padding: 7px 8px;
    font-size: 10px!important;
}
}

.popup .gf-root {
    width: 500px;
    display: flex;
    height: 285px;
}
.gf-cities {
    overflow: hidden;
}
.gf-cities .gf-city {
    padding: 4px 0;
}
.gf-cities .gf-city a {
    display: block;
}
.gf-cities-hint {
    padding-bottom: 10px;
}
svg.mf-location-icon {
    
    width: 14px;
    height: 14px;
        flex-shrink: 0;
        
}
#mf-location-selector:hover svg.mf-location-icon {
    opacity: .8;
}
@media screen and (max-width: 767px) {
    .popup .gf-root {
        height: 85vh;
        min-width: 1px;
    }
}
@media screen and (min-width: 768px) and (max-width: 991px) {
    .header-contacts .contacts__email {
        display: none;
    }
}

/* TODO: Remove once bootstrap4 will be updated in the template core */
.d-inline{display:inline!important}@media (min-width:768px){.d-md-none{display:none!important}}.gf-root .w-100{width:100%}.flex-column{flex-direction:column}.flex-fill{flex:1}.mr-2{margin-right:.5rem}.align-self-center{align-self:center}body[dir=rtl] .mr-2{margin-right:0;margin-left:.5rem}
/* TODO end */

</style>

<style>

.mf-autocomplete{padding-bottom:15px;position:relative}.mf-autocomplete-dropdown{width:100%;height:auto;max-height:185px;position:absolute;overflow-y:auto;background:#fff;z-index:500;margin:0!important;box-shadow:0 3px 5px rgba(0,0,0,.2)}.mf-autocomplete-dropdown>a{display:block;padding:9px 10px;margin:0;color:#8224e3}.mf-autocomplete-dropdown>a.active,.mf-autocomplete-dropdown>a:hover{background:#eee}.gf-current a>img{background-image:url(https://www.rubrankings.com/templates/escort_nova/img/gallery.png)}@media only screen and (-webkit-min-device-pixel-ratio:1.5),only screen and (min--moz-device-pixel-ratio:1.5),only screen and (min-device-pixel-ratio:1.5),only screen and (min-resolution:144dpi){.gf-current a>img{background-image:url(https://www.rubrankings.com/templates/escort_nova/img/@2x/gallery2.png)!important}}

</style>






<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-QHGSJXW8GL"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-QHGSJXW8GL');
</script>

<style>

.top-navigation .popover{
    display:none !important
}


@keyframes zoom {
  0% { transform: scale(1); color: black; }
  50% { transform: scale(1.1); color: blue; }
  100% { transform: scale(1); color: red; } 
}

.animated-custom {
  animation: zoom 2s infinite;
}

</style>

</head>

<body class="large upgrade-listing-page no-sidebar bc-exists header-banner dark-theme listing-fit-contain" >                
    <div class="main-wrapper d-flex flex-column">
               
            <header class="page-header">
                <div class="page-header-mask"></div>
                <div class="point1">
                    <div class="top-navigation">
                        <div class="point1 h-100 d-flex align-items-center">
                            <a class="btn custom-btn mr-lg-3 mr-3" href="https://www.rubrankings.com/cities.html">View Cities</a>
                            <!-- languages selector -->


<!-- languages selector end -->                                                        <!-- Location selector in user navbar | multifield -->

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" class="hide">
    <path id="mf-location" d="M8.758 11.038a1 1 0 01.684.63l1.66 4.646 5.852-13.17L3.808 9.719l4.95 1.32zM.743 10.97c-.89-.237-1.014-1.449-.19-1.86l18-9c.84-.42 1.742.443 1.361 1.3l-8 18c-.367.825-1.552.78-1.856-.07l-2.323-6.505L.743 10.97z" fill-rule="nonzero"/>
</svg>
<span class="circle" id="mf-location-selector">
    <span class="default header-contacts">
        <svg class="mf-location-icon mr-2 align-self-center" viewBox="0 0 20 20"><use xlink:href="#mf-location"></use></svg><span class="flex-fill ">Orlando</span>
    </span>
</span>



<!-- Location selector in user navbar | multifield end -->
                                                
                            <nav class="d-flex flex-fill shrink-fix h-100 justify-content-end user-navbar">
                                                                     <span class="header-contacts d-none d-lg-flex align-items-center font-size-xs font-weight-semibold"  style="color:#ff92a5;flex: 100%;justify-content: center;">
                                       Rubrankings will never request any codes, information, or payments from clients
                                    </span>
                                                                
                                <!-- user navigation bar -->

 <span class="circle  logged-in" id="user-navbar">
    <span class="default"><span>tiffanybraz</span></span>
    <span class="content a-menu hide">
                        
                
    <ul class="account-menu-content">
                                                
            
                            <li >
                                            <a class="font2"
                           title="Edit My Account"
                           href="https://www.rubrankings.com/my-profile.html"
                        >
                                                            My Account
                                                    </a>
                    
                                    </li>
                                                            
            
                            <li >
                                            <a class="font2"
                           title="My Favorite Profiles"
                           href="https://www.rubrankings.com/my-favorites.html"
                        >
                                                            Favorites
                                                    </a>
                    
                                    </li>
                                                            
            
                            <li >
                                            <a class="font2"
                           title="My Body Rubs & Asian Massage Listings"
                           href="https://www.rubrankings.com/my-body-rubs-asian-massage-listings.html"
                        >
                                                            My Listings
                                                    </a>
                    
                                    </li>
                                                            
            
                            <li >
                                            <a class="font2"
                           title="Transactions"
                           href="https://www.rubrankings.com/payment-history.html"
                        >
                                                            Transactions
                                                    </a>
                    
                                    </li>
                                                            
            
                            <li >
                                            <a class="font2"
                           title="My Credits"
                           href="https://www.rubrankings.com/rubrankings-credits.html"
                        >
                                                            Credits
                                                    </a>
                    
                                    </li>
                                                            
            
                            <li >
                                            <a class="font2"
                           title="Get A Verified Badge"
                           href="https://www.rubrankings.com/get-verification.html"
                        >
                                                            Get A Verified Badge
                                                    </a>
                    
                                    </li>
                    
        <li>
            <a title="Log out from your Account"
               href="https://www.rubrankings.com/login.html?action=logout"
               class="font2 logout"
            >
                Log out
            </a>
        </li>
    </ul>

    
            </span>
</span> 
<!-- user navigation bar end -->                                <span class="menu-button d-flex d-lg-none align-items-center" title="Menu">
                                    <svg viewBox="0 0 20 14" class="mr-2">
                                        <use xlink:href="#mobile-menu"></use>
                                    </svg>
                                </span>
                            </nav>
                                                          <a class="btn custom-btn ml-lg-3 ml-2" href="https://www.rubrankings.com/contact-rubrankings.html">Chat with Staff</a>
                        </div>
                    </div>
                                        <div class="header-contacts pt-2  pl-2 pr-2 d-lg-none d-flex align-items-center font-size-xs font-weight-semibold justify-content-center">
                        <p  style="color:#ff92a5;text-align:center;white-space: initial;font-size: 10px;">We will never request any codes, information, or payments from clients</p>
                     </div>
                                         <section class="header-nav d-flex">
                        <div class="point1 d-flex align-items-center">
                            <div>
                                <div class="mr-0 mr-md-3" id="logo">
                                    <a class="d-inline-block" href="https://www.rubrankings.com/united-states/florida/orlando/" title="Feature My Listing">
                                        <img alt="$location_data$ BodyRubs & Massage Directory" src="https://www.rubrankings.com/templates/escort_nova/img/logo.webp" width="100%" height="100%" />
                                    </a>
                                </div>
                            </div>
                            <div class="main-menu flex-fill">
                                <!-- main menu block -->

<div class="menu d-flex justify-content-end">
    <div class="d-none d-lg-flex h-100 align-items-center flex-fill shrink-fix justify-content-end">
        <span class="mobile-menu-header d-none align-items-center">
            <span class="mr-auto">Menu</span>
            <svg viewBox="0 0 12 12">
                <use xlink:href="#close-icon"></use>
            </svg>
        </span>
  
							<a title="Information About RubRankings Body Rubs & Asian Massage Directory"
           class="h-100"
                      href="https://www.rubrankings.com/faqs.html">Faq&rsquo;s</a>
	     
    </div>
       <a title="Information About RubRankings Body Rubs & Asian Massage Directory" class="h-100 creditBalance" href="https://www.rubrankings.com/rubrankings-credits.html" ><img src="https://www.rubrankings.com/templates/escort_nova/img/wallet-icon.png" width="19" class="mr-2"><span class="mr-1 acredit" data-check="0">0.00</span> Credits </a>    
                        <a class="h-100 add-property icon-opacity d-flex" 
                        title="Information About RubRankings Body Rubs & Asian Massage Directory"
            href="https://www.rubrankings.com/new-asian-massage-or-body-rubs-listings.html"><span class="icon-opacity__icon"></span>Add A Listing</a>
                 
                                    <a class="d-flex  add-property icon-opacity get-verified-btn" href="https://www.rubrankings.com/get-verification.html">Get Verified</a>
                         </div>


<!-- main menu block end -->                            </div>
                        </div>
                    </section>
                                        
                                    </div>
            </header>
            
        <!-- page content -->

    
    <div id="wrapper" class="flex-fill w-100">
        <section id="main_container">
            
            
            
            <div class="inside-container point1 clearfix pt-4  pb-5 mt-lg-3">
                
                <div class="row">
                    <!-- left blocks area on home page -->
                                        <!-- left blocks area end -->

                    <section id="content" class="col-lg-12">
                                                    
                                                            <h1>Feature My Listing</h1>
                            
                                                    
                        <div id="system_message">
                            
                            <!-- no javascript mode -->
                                                        <noscript>
                            <div class="warning">
                                <div class="inner">
                                    <div class="icon"></div>
                                    <div class="message">This website makes heavy use of <b>JavaScript</b>, please enable JavaScript in your browser to continue comfort use of the website.</div>
                                </div>
                            </div>
                            </noscript>
                                                        <!-- no javascript mode end -->
                        </div>

                                                                            
                        <section id="controller_area"><!-- upgrade listing plan -->




	

	<form method="post" action="https://www.rubrankings.com/upgrade-listing/featured.html?id=50828">
		<input type="hidden" name="upgrade" value="true" />
		<input type="hidden" name="from_post" value="1" />

		<!-- select a plan -->
		<!-- divider line tpl -->

<div class="fieldset divider col-12">
	<header >Select a Package</header>
</div>

<!-- divider line tpl end -->
		<div class="plans-container">
                                                <ul class="plans">
			
    <style>
        ul.plans>li>div.frame>span.name {
            color: #5d16e9 !important;
            text-transform: capitalize;
            font-size: 23px;
            font-weight: bold;
            font-family: poppins;
            height: 100px !important;
        }
        ul.plans>li>div.frame{
            border: 3px solid #5d16e9 !important;
        }
        @media(max-width:768px)
        {
            .plan label{
                color:#000 !important
            }
        }
    </style>

<!-- listing plan tpl --><li id="plan_29" class="plan">
    <div class="frame colored" style="background-color: #ffffff;border-color: #ffffff;">
    
         <span class="name">Upgrade To Featured For 30 Days</span> 

        
        <span class="price">
                            $                60
                                    </span>
        <span title="" class="type">
            
        </span><span title="Profile live period" class="count">
            30 Days        </span>

        
        <!-- bumpup listing plan tpl -->


<!-- bumpup listing plan tpl end -->

   		            <span class="description">
                <img class="qtip middle-bottom" alt="" title="Your Profile will be featured for 30 days." id="fd_" src="https://www.rubrankings.com/templates/escort_nova/img/blank.gif" />
            </span>
        
        <div class="selector">
                            <label >
                    <input class="multiline" 
                         
                        type="radio"
                        name="plan"
                        value="29" 
                                                />
                                                    Featured Profile
                        
                                            </label>
            
                    </div>
    </div>
</li><!-- listing plan tpl end -->
    <style>
        ul.plans>li>div.frame>span.name {
            color: #5d16e9 !important;
            text-transform: capitalize;
            font-size: 23px;
            font-weight: bold;
            font-family: poppins;
            height: 100px !important;
        }
        ul.plans>li>div.frame{
            border: 3px solid #5d16e9 !important;
        }
        @media(max-width:768px)
        {
            .plan label{
                color:#000 !important
            }
        }
    </style>

<!-- listing plan tpl --><li id="plan_44" class="plan">
    <div class="frame colored" style="background-color: #ff8c00;border-color: #ff8c00;">
    
         <span class="name">Upgrade To Featured For 7 days</span> 

        
        <span class="price">
                            $                20
                                    </span>
        <span title="" class="type">
            
        </span><span title="Profile live period" class="count">
            7 Days        </span>

        
        <!-- bumpup listing plan tpl -->


<!-- bumpup listing plan tpl end -->

   		            <span class="description">
                <img class="qtip middle-bottom" alt="" title="Your Profile will be featured for 7 days." id="fd_" src="https://www.rubrankings.com/templates/escort_nova/img/blank.gif" />
            </span>
        
        <div class="selector">
                            <label >
                    <input class="multiline" 
                         
                        type="radio"
                        name="plan"
                        value="44" 
                                                />
                                                    Featured Profile
                        
                                            </label>
            
                    </div>
    </div>
</li><!-- listing plan tpl end -->			</ul>
		</div>

		<script type="text/javascript">
		var plans = Array();
		var selected_plan_id = 0;
		var last_plan_id = 0;
				plans[29] = new Array();
		plans[29]['Key'] = 'featured_paid';
		plans[29]['Price'] = 60;
		plans[29]['Featured'] = 0;
		plans[29]['Advanced_mode'] = 0;
		plans[29]['Package_ID'] = false;
		plans[29]['Standard_listings'] = 0;
		plans[29]['Featured_listings'] = 0;
		plans[29]['Standard_remains'] = false;
		plans[29]['Featured_remains'] = false;
		plans[29]['Listings_remains'] = false;
				plans[44] = new Array();
		plans[44]['Key'] = 'featured_paid_new';
		plans[44]['Price'] = 20;
		plans[44]['Featured'] = 0;
		plans[44]['Advanced_mode'] = 0;
		plans[44]['Package_ID'] = false;
		plans[44]['Standard_listings'] = 0;
		plans[44]['Featured_listings'] = 0;
		plans[44]['Standard_remains'] = false;
		plans[44]['Featured_remains'] = false;
		plans[44]['Listings_remains'] = false;
			
		
	
		$(document).ready(function(){
			flynax.planClick();
			flynax.qtip();
		});
		
		
		</script>
		<!-- select a plan end -->

		<div class="form-buttons">
			<input type="submit" value="Next" />
		</div>
		
	</form>

	
	

<!-- upgrade listing plan end --></section>

                                                    <!-- middle blocks area -->
                                                        <!-- middle blocks area end -->

                            
                                                                        </section>
                </div>
            </div>
        </section>
    </div>

    
<!-- page content end --><section id="custom_main_container">
    <div class="inside-container point1 clearfix">
      <div class="row">
            <div class="col-md-12">
            </div>
    </div>
    </div>
</section>
            <footer class="page-footer content-padding">
            <div class="point1 clearfix">
                <div class="row">
                    <nav class="footer-menu col-12">
                            <!-- footer menu block -->

<div class="custom_menu_footer">
        
                                    	    <div>
                <a  title="Body Rubs All Across America. Find Body Rubs & Escorts On Rubrankings." href="https://www.rubrankings.com/cities.html">
                    View Cities
                </a>
            </div>
                                    	    <div>
                <a  title="Law Enforcement Guide" href="https://www.rubrankings.com/law-enforcement-guide-for-rub-rankings.html">
                    Law & Legal
                </a>
            </div>
                                    	    <div>
                <a  title="Rub Ranking Anti-Trafficking Policy" href="https://www.rubrankings.com/rub-ranking-anti-trafficking-policy.html">
                    Anti-Trafficking
                </a>
            </div>
                
                                    	    <div>
                <a  title="Section 2257 Exemption Statement For Rub Rankings" href="https://www.rubrankings.com/section-2257-exemption-statement.html">
                    Section 2257
                </a>
            </div>
                                    	    <div>
                <a  title="Rub Rankings Terms & Conditions" href="https://www.rubrankings.com/rub-rankings-terms-conditions.html">
                    Terms
                </a>
            </div>
                                    	    <div>
                <a  title="Get Help From Staff" href="https://www.rubrankings.com/contact-rubrankings.html">
                    Get Help From Staff
                </a>
            </div>
                
                                    	    <div>
                <a  title="The Best Rubmd & RubRating Best Equivalent" href="https://www.rubrankings.com/rubmd.html">
                    Rubmd 
                </a>
            </div>
                                    	    <div>
                <a  title="ECCIE Alternative: What Is ECCIE?" href="https://www.rubrankings.com/eccie.html">
                    Eccie
                </a>
            </div>
            </div>
<!-- footer menu block end -->                    </nav>
                </div>
            </div>
        </footer>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="hide">
    <path id="dropdown-arrow-down" d="M4 2.577L1.716.293a1.01 1.01 0 0 0-1.423 0 1.01 1.01 0 0 0 0 1.423l2.991 2.99C3.481 4.903 3.741 5 4 5c.26.001.52-.096.716-.293l2.991-2.99a1.01 1.01 0 0 0 0-1.423 1.01 1.01 0 0 0-1.423 0L4 2.577z" />
    <path id="envelope-small" d="M12 1L6 3.988 0 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1zm0 1.894V9a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V3l6 3 6-3.106z" />
    <path id="handset" d="M3.327 2.868c-.27-.447-.792-1.305-1.097-1.8-.566.256-1.265 1.17-1.229 1.837.125 2.204 2.03 5.008 4.62 6.778 2.582 1.764 4.545 1.724 5.292.096-.511-.304-1.343-.794-1.76-1.037-.05.058-.11.128-.176.21l-.028.034-.026.033-.19.242H8.73a6.186 6.186 0 0 1-.297.368c-.476.48-.936.64-1.56.412-1.67-.627-4.88-3.775-4.946-5.331l-.001-.05c.002-.423.197-.724.525-1.045.04-.038.008-.012.331-.28l.246-.206.044-.037.042-.037c.088-.076.157-.137.212-.187z" fill-rule="nonzero" stroke="#000000" stroke-width="2" />
    <path id="mobile-menu" d="M1 0h18a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2zm0 6h18a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2zm0 6h18a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2z" fill-rule="evenodd"/>
    <path id="close-icon" d="M.293 1.707A1 1 0 0 1 1.707.293L6 4.586 10.293.293a1 1 0 0 1 1.414 1.414L7.414 6l4.293 4.293a1 1 0 0 1-1.414 1.414L6 7.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L4.586 6 .293 1.707z" />
</svg>        <!-- verification code plugin -->


<!-- verification code plugin -->    <div class="hide d-none" id="gf_tmp">
        <div class="gf-root flex-column">
            <!-- multifield location autocomplete tpl -->

<div class="mf-autocomplete kws-block">
    <input class="mf-autocomplete-input w-100" type="text" maxlength="64" placeholder="Type your location here" />
    <div class="mf-autocomplete-dropdown hide"></div>
</div>



<!-- multifield location autocomplete tpl end -->
            <div class="gf-cities-hint font-size-sm">Search for a city or select popular from the list</div>
            <div class="gf-cities flex-fill"></div>
                            <div class="gf-navbar">
                    <a href="javascript://" data-link="https://www.rubrankings.com/upgrade-listing/featured.html" class="nowrap text-overflow button w-100 align-center gf-ajax">Reset Location<span class="d-inline d-md-none"> (Orlando)</span></a>
                </div>
                    </div>
    </div>

    

            <script id="gf_city_item" type="text/x-jsrender">
        <li class="col-md-4 col-sm-6 col-6">
            <div class="gf-city">
                <a title="[%:name%]"
                                            href="javascript://" class="gf-ajax text-overflow"
                                       data-path="[%:Path%]" data-key="[%:Key%]">[%:name%]</a>
            </div>
        </li>
    </script>
    

    </div>



 

    <style>
.freeCreditMessage{background:bottom/cover no-repeat #8224e3;position:fixed;left:0;bottom:0;z-index:9999;width:100%}.freeCreditMessage .point1{margin:0 auto;position:relative}.freeCreditMessage .custom-btn{background:#fff!important;color:#000!important;padding:0 22px;border-radius:22px;height:36px;font-size:14px!important}@media(max-width:576px){.freeCreditMessage{padding:0 8px}}.freeCreditMessage p{color:#fff;font-size:18px;text-wrap:nowrap}@media(max-width:768px){.freeCreditMessage p{text-align:center;font-size:14px}.freeCreditMessage::before{content:'';position:absolute;top:0;bottom:0;left:0;right:0;width:100%;height:100%;background:rgba(0,0,0,.4)}}.page-footer>div{padding:23px 0 74px!important}
    </style>


<div class="freeCreditMessage">
    <div class="point1 pt-2 pb-2">
        <div class="row">
            <div class="col-md-12">
                  <div class="d-flex justify-content-center align-items-center" style="flex-wrap:wrap">
                    <div class="d-lg-flex align-items-center mr-3">
                
                        <p>Attn Providers: Any Text Asking For Verification Is A Scam</p>
                    </div>
                                     </div>
            </div>
        </div> 
    </div>
</div>

   <div class="switchStatu">
        <input type="checkbox" hidden="hidden" id="username" >
         <label class="switch mr-2" for="username"></label>Only Verified Profiles
    </div>
    
      <script>

    $(document).ready(function() {
        $('.switchStatu').on('click', function() {
                var checkbox = $('#username');
                checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
            });
            
        $('#username').change(function() {
            var isChecked = $(this).is(':checked');
            $.ajax({
                type: 'POST',
                url: 'https://www.rubrankings.com/request.ajax.php',
                data: {
                    mode:'hideverifiedProfile',
                    checkValue : isChecked
                },
                cache: false,
                success: function(response) {
                     location.reload();
            }
        });
        
    });
});

    </script>

<script src="https://www.rubrankings.com/templates/escort_nova/js/lozad.min.js" ></script>
<script>


lozad('.listinglozad', {
    load: function(el) {
        el.src = el.dataset.src;
        el.onload = function() {
            el.classList.add('fade')
        }
    }
}).observe();
 

</script>
    <link rel="stylesheet" href="https://www.rubrankings.com/templates/escort_nova/components/popup/popup.css?v=1757345315" />
<link rel="stylesheet" href="https://www.rubrankings.com/templates/escort_nova/components/plans-chart/plans-chart.css?v=1757345315" />

    <script src="https://www.rubrankings.com/templates/escort_nova/js/util.js"></script>
<script src="https://www.rubrankings.com/templates/escort_nova/js/jquery.flModal.js"></script>
<script src="https://www.rubrankings.com/libs/jquery/cookie.js"></script>
<script src="https://www.rubrankings.com/libs/jquery/numeric.js"></script>
<script>flUtil.init();</script>
<script>
var mf_current_location = "Orlando, Florida";
var mf_location_autodetected = true;
lang['mf_is_your_location'] = 'Is {location} your location?';
lang['mf_no_location_in_popover'] = 'We were unable to detect your location, do you want to select your city from the list?';
lang['mf_select_location'] = 'Please Select Your City';
lang['yes'] = 'Yes';
lang['no'] = 'No';


$(function(){
    var popupPrepared = false;
    var $buttonDefault = $('#mf-location-selector');
    var $button = $buttonDefault.find(' > .default');
    var cities = [];

    $('.gf-root').on('click', 'a.gf-ajax', function(){
        gfAjaxClick($(this).data('key'), $(this).data('path'), $(this).data('link'))
    });

    var showCities = function(){
        if (cities.length) {
            var $container = $('.gf-cities');

            if (!$container.find('ul').length) {
                var $list = $('<ul>').attr('class', 'list-unstyled row');

                $list.append($('#gf_city_item').render(cities));
                $container.append($list);
            }
        }
    }

    var showPopup = function(){
        var $geoFilterBox = $('.gf-root');

        $('#mf-location-selector').popup({
            click: false,
            scroll: false,
            content: $geoFilterBox,
            caption: lang['mf_select_location'],
            onShow: function(){
                showCities();

                $buttonDefault.unbind('click');

                createCookie('mf_usernavbar_popup_showed', 1, 365);
            },
            onClose: function($interface){
                var tmp = $geoFilterBox.clone();
                $('#gf_tmp').append($geoFilterBox);

                // Keep clone of interface to allow the box looks properly during the fade affect
                $interface.find('.body').append(tmp);

                this.destroy();
            }
        });
    }

    var getCities = function(){
        flUtil.ajax({
            mode: 'mfGetCities',
            path: location.pathname
        }, function(response, status) {
            if (status == 'success' && response.status == 'OK') {
                cities = response.results;
                showCities();
            } else {
                console.log('GeoFilter: Unable to get popular cities, ajax request failed')
            }
        });
    }

    var initPopup = function(){
        if (popupPrepared) {
            showPopup();
        } else {
            flUtil.loadScript([
                rlConfig['tpl_base'] + 'components/popup/_popup.js',
                rlConfig['libs_url'] + 'javascript/jsRender.js'
            ], function(){
                showPopup();
                getCities();
                popupPrepared = true;
            });
        }
    }

    if (!readCookie('mf_usernavbar_popup_showed')) {
        flUtil.loadStyle(rlConfig['tpl_base'] + 'components/popover/popover.css');
        flUtil.loadScript(rlConfig['tpl_base'] + 'components/popover/_popover.js', function(){
            var closeSave = function(popover){
                popover.close()
                createCookie('mf_usernavbar_popup_showed', 1, 365);
            }

            var $content = $('<div style="color:#fff">').append(
                mf_location_autodetected
                    ? lang['mf_is_your_location'].replace('{location}', '<b>' + mf_current_location + '</b>')
                    : lang['mf_no_location_in_popover']
            );

            $buttonDefault.popover({
                width: 200,
                content: $content,
                navigation: {
                    okButton: {
                        text: lang['yes'],
                        class: 'low',
                        onClick: function(popover){
                            closeSave(popover);

                            if (!mf_location_autodetected) {
                                setTimeout(function(){
                                    initPopup();
                                }, 10);
                            }
                        }
                    },
                    cancelButton: {
                        text: lang['no'],
                        class: 'low cancel',
                        onClick: function(popover){
                            closeSave(popover);

                            if (mf_location_autodetected) {
                                setTimeout(function(){
                                    initPopup();
                                }, 10);
                            }
                        }
                    }
                }
            }).trigger('click');

            $button.click(function(){
                initPopup();
            });
        });
    } else {
        $button.click(function(){
            initPopup();
        });
    }
});


</script>
<script>
    var mf_script_loaded = false;
    var mf_current_key   = 'countries_united_states_florida_orlando';

    rlPageInfo['Geo_filter'] = false;

    
    $(function(){
        $('.mf-autocomplete-input').on('focus keyup', function(){
            if (!mf_script_loaded) {
                flUtil.loadScript(rlConfig['plugins_url'] + 'multiField/static/autocomplete.js');
                mf_script_loaded = true;
            }
        });
    });
    
</script>

    <script>
        $(function () {
            flUtil.loadScript(rlConfig.tpl_base + 'js/form.js', function () {
                $('select.select-autocomplete').each(function () {
                    flForm.addAutocompleteForDropdown($(this));
                });

                $('.show-phone').click(function () {
                    let $phone = $(this).parent().find('.hidden-phone');
                    flForm.showHiddenPhone($phone, $phone.data('entity-id'), $phone.data('entity'), $phone.data('field'));
                });
            });
        });
    </script>

    <script>

jQuery.event.special.touchstart={setup:function(e,t,s){this.addEventListener("touchstart",s,{passive:!t.includes("noPreventDefault")})}},jQuery.event.special.touchmove={setup:function(e,t,s){this.addEventListener("touchmove",s,{passive:!t.includes("noPreventDefault")})}},jQuery.event.special.wheel={setup:function(e,t,s){this.addEventListener("wheel",s,{passive:!0})}},jQuery.event.special.mousewheel={setup:function(e,t,s){this.addEventListener("mousewheel",s,{passive:!0})}},$("#form-checkout").submit(function(){$("#form-checkout .form-buttons input[type=submit]").addClass("disabled"),$("#form-checkout .form-buttons input[type=submit]").attr("disabled","disabled"),$("#form-checkout .form-buttons input[type=submit]").val("Loading...")});

</script>



<script>



$(".hideWithLogin").click(function(){
    var this_c = $(this);
    var id = $(this).attr('data-id');
    $.ajax({
        type: 'POST',
        url: 'https://www.rubrankings.com/request.ajax.php',
        data: {
            mode:'addhide',
            id : id
        },
        cache: false,
        success: function(response) {
              $(this_c).parent().parent().hide('fast', function(){ $(this_c).remove(); });
            location.reload();
    }
    });
});




$(".removeHidden").click(function(){
    var this_c = $(this);
    var id = $(this).attr('data-id');
    $.ajax({
        type: 'POST',
        url: 'https://www.rubrankings.com/request.ajax.php',
        data: {
            mode:'removeHidden',
            id : id
        },
        cache: false,
        success: function(response) {
              $(this_c).parent().hide('fast', function(){ $(this_c).remove(); });
        location.reload();
    }
    });
});


</script>

<script defer src="https://static.cloudflareinsights.com/beacon.min.js/vcd15cbe7772f49c399c6a5babf22c1241717689176015" integrity="sha512-ZpsOmlRQV6y907TI0dKBHq9Md29nnaEIPlkf84rnaERnq6zvWvPUqr2ft8M1aS28oN72PdrCzSjY4U6VaAw1EQ==" data-cf-beacon='{"rayId":"97bf79fc4ff6da7b","serverTiming":{"name":{"cfExtPri":true,"cfEdge":true,"cfOrigin":true,"cfL4":true,"cfSpeedBrain":true,"cfCacheStatus":true}},"version":"2025.8.0","token":"d9f57ade18c14cd18fb2a18f54f05202"}' crossorigin="anonymous"></script>
</body>
</html>