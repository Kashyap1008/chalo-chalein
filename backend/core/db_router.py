"""
Database Router for Multi-Database architecture.
Separates Primary User Database ('default') and Admin Database ('admin_db').
"""

class AdminDatabaseRouter:
    """
    A router to control all database operations on models across
    'default' (User & Trips Database) and 'admin_db' (Admin Database).
    """

    def db_for_read(self, model, **hints):
        # Specific admin audit / staff queries can use admin_db
        if hints.get('use_admin_db', False):
            return 'admin_db'
        return 'default'

    def db_for_write(self, model, **hints):
        if hints.get('use_admin_db', False):
            return 'admin_db'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # Allow core authentication and tables on both databases
        if app_label in ('accounts', 'auth', 'contenttypes', 'sessions', 'token_blacklist'):
            return True
        if db == 'admin_db':
            return app_label in ('accounts', 'auth', 'contenttypes', 'sessions')
        return db == 'default'
