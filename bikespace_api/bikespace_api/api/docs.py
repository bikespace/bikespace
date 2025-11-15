from flask import Blueprint, render_template

docs_blueprint = Blueprint("docs", __name__)


@docs_blueprint.route("/docs/", methods=["GET"])
def api_docs():
    return render_template("swagger-ui.html")
