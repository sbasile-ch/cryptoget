#! /usr/bin/env perl
use Getopt::Long;

#__________________ OPTIONS
sub opt_info {($type, $desc) = @_; return {'type'=>$type, 'desc'=>$desc}}
sub opt_name {($opt) = @_; return  sprintf "--%s|-%s", $opt, substr $opt, 0, 1 }
@CURRENCY_PAIRS = qw / btcusd btceur eurusd xrpusd xrpeur xrpbtc ltcusd ltceur
                       ltcbtc ethusd etheur ethbtc bchusd bcheur bchbtc /;
%OPT=( 'pair'           => opt_info ('=s',  'specify a currency from this range ('.join ('|', @CURRENCY_PAIRS) .')'),
       'base-url'       => opt_info ( ':s', 'specify an API base URL' ),
       'max-connection' => opt_info ( ':s', 'specify timeout on HTTP request' ),
       'colour'         => opt_info ( '',   'turn colour off' ),
       'help'           => opt_info ( '',   'print this help' ));
%VARS = ();
#__________________ USAGE
(( $l = length $_) && ($max_opt < $l) && ($max_opt = $l)) foreach keys %OPT;
$max_opt += length '[--|--]';
$USAGE = "Usage: $0 ".join (' ', ( map {sprintf "\n%-*s%s",  $max_opt, opt_name($_), $OPT{$_}{desc}} keys %OPT));
#__________________ CONSTS
%COLS = ('bg'=>"\e[40m", 'title'=>"\e[36m", 'field'=>"\e[33m", 'val'=>"\e[1;32m", 'stop'=>"\e[0m");

#__________________ BYE
sub Exit { print "@_\n"; exit }
#__________________
sub init_args {
   @getop = map { "$_$OPT{$_}{type}" } keys %OPT;

   Exit($USAGE) if ! GetOptions(\%VARS, @getop) or $VARS{help};
   #_______ set defaults
   $VARS{'base-url'} = $ENV{BASE_URL} || 'https://www.bitstamp.net/api/v2/ticker/' if ! $VARS{'base-url'};
   $VARS{'max-connection'} = $ENV{MAX_CURL_TIME} || 10 if ! $VARS{'max-connection'};
   %COLS=() if $VARS{colour};

   Exit("$err\n$USAGE") if ($err = check_args());
}
#__________________
sub check_args {
    %range = map { $_ => 1 } @CURRENCY_PAIRS;
    return 'missing currency selection' if ! $VARS{pair};
    return "$VARS{pair} not in range" if ! $range{$VARS{pair}};
    return 0;
}
#__________________
sub get_json {
    $cmd = "curl -s -m $VARS{'max-connection'} $VARS{'base-url'}@_";
    return ($_ = qx{$cmd 2>&1}, $? >> 8);  # return both curl response and curl exit code
}
#__________________
sub print_json {
    my ($str, %json_data) = @_;
    for (; $str =~ /"([^"]+)"\s*:\s*"([^"]+)"/; $json_data{$1}=$2, $str=$'){}

    $title = 'Current price as of ' . scalar(localtime($json_data{timestamp}));
    $out   = "$COLS{bg}$COLS{title}$title$COLS{stop}";
    $line  = '=' x length($title);
    $out  .= "\n$COLS{bg}$COLS{title}$line$COLS{stop}\n" . join ("\n", sort (map { $_ eq 'timestamp' ?
             () : "\t$COLS{bg}$COLS{field}$_\t$COLS{bg}$COLS{val}$json_data{$_}$COLS{stop}" } keys %json_data));
    print "$out\n";
}
#__________________
sub main {
   init_args();
   ($str, $exit_code) = get_json ($VARS{pair});
   if ( $exit_code or (substr ($str, 0, 1) ne '{' )) {
       printf "error on API call: [%s][%.30s..]\n", $exit_code, $str;
   } else {
       print_json($str);
   }
}

main;
