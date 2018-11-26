#! /usr/bin/env perl

use Getopt::Long;

@CURRENCY_PAIRS = qw / btcusd btceur eurusd xrpusd xrpeur xrpbtc ltcusd ltceur
                       ltcbtc ethusd etheur ethbtc bchusd bcheur bchbtc /;
$USAGE="Usage $0 --pair (" . join ('|', @CURRENCY_PAIRS) . ') [--base_url] [--max_connection]';
$EXIT_MSG=$USAGE;

sub Exit {
    die "$EXIT_MSG\n";
}

$currency_pair = '';
$BASE_URL;
$MAX_CURL_TIME;

print $USAGE;
GetOptions(
              'pair=s' => \$currency_pair,
              'base_url:s' => \$BASE_URL,
              'max_connection:s' => \$MAX_CURL_TIME
          );
$BASE_URL=$ENV{BASE_URL} || "https://www.bitstamp.net/api/v2/ticker/" if ! $BASE_URL;
$MAX_CURL_TIME=$ENV{MAX_CURL_TIME} || 10 if ! $MAX_CURL_TIME;


$json = `curl -m $MAX_CURL_TIME $BASE_URL$currency_pair`;
print "retrievig $BASE_URL$currency_pair: $json\n";


