"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTripTime, formatPrice } from "@/types";

interface TripItem {
  id: number | string;
  code: string;
  from: string;
  to: string;
  time: Date | string;
  price: number;
  availableSeats: number;
}

interface TripListWithFilterProps {
  initialTrips: TripItem[];
}

