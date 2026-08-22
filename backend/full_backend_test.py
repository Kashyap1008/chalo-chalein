"""
Comprehensive Backend Test Script for Chalo Chalein.
Tests all Accounts, Catalog, Trips, and Budget endpoints live.
"""
import sys
import time
import requests

# Ensure UTF-8 output formatting for Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://127.0.0.1:8000/api'


def run_tests():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE BACKEND API TESTS")
    print("=" * 60)

    # ----------------------------------------------------
    # 1. ACCOUNTS & AUTH TESTS
    # ----------------------------------------------------
    print("\n[1/4] Testing Auth & Accounts App...")

    # 1.1 Health / Stats (Public)
    r = requests.get(f"{BASE}/auth/stats/")
    assert r.status_code == 200, f"Stats failed: {r.status_code}"
    print("  [PASS] GET /api/auth/stats/ -> 200 OK")

    # 1.2 Register new test user
    test_email = f"suite_test_{int(time.time())}@demo.com"
    r = requests.post(f"{BASE}/auth/register/", json={
        "email": test_email,
        "username": f"user_{int(time.time())}",
        "password": "Password123!",
        "password2": "Password123!"
    })
    assert r.status_code == 201, f"Register failed: {r.status_code} {r.text}"
    user_data = r.json()
    print(f"  [PASS] POST /api/auth/register/ -> 201 Created (user_id={user_data['user']['id']})")

    # 1.3 Login with custom user payload
    r = requests.post(f"{BASE}/auth/login/", json={
        "email": test_email,
        "password": "Password123!"
    })
    assert r.status_code == 200, f"Login failed: {r.status_code}"
    auth_data = r.json()
    access = auth_data["access"]
    refresh = auth_data["refresh"]
    headers = {"Authorization": f"Bearer {access}"}
    print("  [PASS] POST /api/auth/login/ -> 200 OK (returned user + tokens)")

    # 1.4 Profile GET & PATCH
    r = requests.get(f"{BASE}/auth/profile/", headers=headers)
    assert r.status_code == 200, "Profile GET failed"
    print("  [PASS] GET /api/auth/profile/ -> 200 OK")

    r = requests.patch(f"{BASE}/auth/profile/", json={"bio": "Testing suite bio"}, headers=headers)
    assert r.status_code == 200 and r.json()["bio"] == "Testing suite bio", "Profile PATCH failed"
    print("  [PASS] PATCH /api/auth/profile/ -> 200 OK (Bio updated)")

    # 1.5 Users list (Admin)
    r = requests.get(f"{BASE}/auth/users/", headers=headers)
    assert r.status_code == 200, "Users list failed"
    print("  [PASS] GET /api/auth/users/ -> 200 OK")

    # ----------------------------------------------------
    # 2. CATALOG TESTS
    # ----------------------------------------------------
    print("\n[2/4] Testing Catalog App (Cities & Activities)...")

    r = requests.get(f"{BASE}/catalog/cities/")
    assert r.status_code == 200, "Cities list failed"
    cities = r.json().get("results", [])
    assert len(cities) > 0, "No cities found!"
    city1 = cities[0]
    print(f"  [PASS] GET /api/catalog/cities/ -> 200 OK ({len(cities)} cities listed)")

    # Search city
    r = requests.get(f"{BASE}/catalog/cities/?search={city1['name']}")
    assert r.status_code == 200, "City search failed"
    print(f"  [PASS] GET /api/catalog/cities/?search={city1['name']} -> 200 OK")

    # City detail
    r = requests.get(f"{BASE}/catalog/cities/{city1['id']}/")
    assert r.status_code == 200, "City detail failed"
    print(f"  [PASS] GET /api/catalog/cities/{city1['id']}/ -> 200 OK")

    # Activities list
    r = requests.get(f"{BASE}/catalog/activities/?city={city1['id']}")
    assert r.status_code == 200, "Activities list failed"
    activities = r.json().get("results", [])
    print(f"  [PASS] GET /api/catalog/activities/?city={city1['id']} -> 200 OK ({len(activities)} activities)")

    # ----------------------------------------------------
    # 3. TRIPS & STOPS TESTS
    # ----------------------------------------------------
    print("\n[3/4] Testing Trips, Stops & TripActivities App...")

    # Create trip
    r = requests.post(f"{BASE}/trips/", json={
        "name": "Integration Test Trip",
        "description": "Automated test trip description",
        "start_date": "2026-09-01",
        "end_date": "2026-09-05",
        "is_public": True
    }, headers=headers)
    assert r.status_code == 201, f"Trip creation failed: {r.status_code} {r.text}"
    trip = r.json()
    trip_id = trip["id"]
    share_code = trip["share_code"]
    print(f"  [PASS] POST /api/trips/ -> 201 Created (id={trip_id}, share_code={share_code})")

    # Add stop
    r = requests.post(f"{BASE}/trips/{trip_id}/stops/", json={
        "city": city1["id"],
        "start_date": "2026-09-01",
        "end_date": "2026-09-03",
        "stay_cost": 3000.00,
        "order": 1,
        "notes": "Stop 1 test notes"
    }, headers=headers)
    assert r.status_code == 201, f"Stop creation failed: {r.status_code} {r.text}"
    stop = r.json()
    stop_id = stop["id"]
    print(f"  [PASS] POST /api/trips/{trip_id}/stops/ -> 201 Created (stop_id={stop_id})")

    # Add activity to stop if activity exists
    if len(activities) > 0:
        act1 = activities[0]
        r = requests.post(f"{BASE}/trips/stops/{stop_id}/activities/", json={
            "activity": act1["id"],
            "title": act1["name"],
            "scheduled_date": "2026-09-01",
            "scheduled_time": "10:00",
            "cost": float(act1["cost"])
        }, headers=headers)
        assert r.status_code == 201, f"TripActivity creation failed: {r.status_code} {r.text}"
        print(f"  [PASS] POST /api/trips/stops/{stop_id}/activities/ -> 201 Created")

    # ----------------------------------------------------
    # 4. BUDGET & PUBLIC SHARE TESTS
    # ----------------------------------------------------
    print("\n[4/4] Testing Budget Calculation & Public Share Link...")

    # Budget
    r = requests.get(f"{BASE}/trips/{trip_id}/budget/", headers=headers)
    assert r.status_code == 200, f"Budget calculation failed: {r.status_code}"
    budget = r.json()

    # Reordering stops endpoint test
    r = requests.post(f"{BASE}/trips/{trip_id}/reorder-stops/", json={
        "orders": [{ "id": stop_id, "order": 1 }]
    }, headers=headers)
    assert r.status_code == 200, "Reorder stops failed"
    print("  [PASS] POST /api/trips/<id>/reorder-stops/ -> 200 OK")

    # Clone trip endpoint test
    r = requests.post(f"{BASE}/trips/{trip_id}/clone/", headers=headers)
    assert r.status_code == 201, "Clone trip failed"
    print("  [PASS] POST /api/trips/<id>/clone/ -> 201 Created (Cloned trip)")

    assert "grand_total" in budget and budget["grand_total"] >= 3000.0, "Grand total missing or incorrect"
    print(f"  [PASS] GET /api/trips/{trip_id}/budget/ -> 200 OK (Grand Total = {budget['grand_total']})")

    # Public Share Link
    r = requests.get(f"{BASE}/trips/shared/{share_code}/")
    assert r.status_code == 200, f"Public trip view failed: {r.status_code}"
    public_trip = r.json()
    assert public_trip["name"] == "Integration Test Trip", "Public trip name mismatch"
    print(f"  [PASS] GET /api/trips/shared/{share_code}/ -> 200 OK (Read-only Public View)")

    # Logout
    r = requests.post(f"{BASE}/auth/logout/", json={"refresh": refresh}, headers=headers)
    assert r.status_code == 205, "Logout failed"
    print("  [PASS] POST /api/auth/logout/ -> 205 Reset Content")

    print("\n" + "=" * 60)
    print("ALL BACKEND API ENDPOINTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
