import 'package:flutter/material.dart';

@immutable
class Place {
  final String name;
  final String emoji;
  final String? description;
  final double latitude;
  final double longitude;

  const Place({
    required this.name,
    required this.emoji,
    this.description,
    required this.latitude,
    required this.longitude,
  });
}

const List<Place> places = [
  Place(name: 'Turtle Tower', emoji: '\u{1F35C}', latitude: 37.7877, longitude: -122.4107),
  Place(name: 'Deli Board', emoji: '\u{1F96A}', latitude: 37.7785, longitude: -122.3985),
  Place(name: 'Akari Japanese Bistro', emoji: '\u{1F363}', latitude: 37.7768, longitude: -122.3990),
  Place(name: 'Starlite', emoji: '\u{1F379}', latitude: 37.7856, longitude: -122.4079),
  Place(name: 'Ushi Taro Ramen SOMA', emoji: '\u{1F35C}', latitude: 37.7740, longitude: -122.4090),
  Place(name: 'Basil Thai Restaurant & Bar', emoji: '\u{1F35B}', latitude: 37.7780, longitude: -122.3990),
  Place(name: '620 Jones', emoji: '\u{1F378}', latitude: 37.7865, longitude: -122.4127),
  Place(
    name: 'Spark Social SF',
    emoji: '\u{1F32D}',
    description: 'Food truck park with lots of options, next to mini golf',
    latitude: 37.7700,
    longitude: -122.3920,
  ),
  Place(name: 'Pagan Idol', emoji: '\u{1F379}', latitude: 37.7905, longitude: -122.4035),
  Place(name: 'Cafe Okawari', emoji: '\u{2615}', latitude: 37.7762, longitude: -122.3925),
  Place(name: 'Ebiko', emoji: '\u{1F363}', latitude: 37.7890, longitude: -122.3985),
  Place(name: 'Arsicault Bakery Civic Center', emoji: '\u{1F950}', latitude: 37.7792, longitude: -122.4155),
  Place(name: 'Pie Punks', emoji: '\u{1F355}', latitude: 37.7875, longitude: -122.3990),
  Place(name: 'Liholiho Yacht Club', emoji: '\u{1F37D}', latitude: 37.7880, longitude: -122.4100),
  Place(name: 'Pink Onion', emoji: '\u{1F9C5}', latitude: 37.7680, longitude: -122.4220),
  Place(name: 'Bluestone Lane SOMA Coffee Shop', emoji: '\u{2615}', latitude: 37.7870, longitude: -122.3985),
  Place(name: 'Dumpling Time Design District', emoji: '\u{1F95F}', latitude: 37.7697, longitude: -122.4070),
  Place(name: 'Rintaro', emoji: '\u{1F376}', latitude: 37.7678, longitude: -122.4220),
  Place(name: 'Bodega SF', emoji: '\u{1F378}', latitude: 37.7870, longitude: -122.4100),
  Place(name: 'Moscone Center', emoji: '\u{1F3DB}', latitude: 37.7840, longitude: -122.4010),
  Place(name: 'Harlan Records', emoji: '\u{1F3B5}', latitude: 37.7870, longitude: -122.4060),
  Place(name: 'Sightglass Coffee', emoji: '\u{2615}', latitude: 37.7742, longitude: -122.4117),
  Place(name: 'The Bird', emoji: '\u{1F357}', latitude: 37.7855, longitude: -122.4010),
  Place(name: 'Garaje', emoji: '\u{1F32E}', latitude: 37.7830, longitude: -122.3975),
  Place(name: 'Square Pie Guys', emoji: '\u{1F355}', latitude: 37.7853, longitude: -122.4000),
];
