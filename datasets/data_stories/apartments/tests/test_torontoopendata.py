from apartments.torontoopendata import request_tod_df


def test_registration():
    df, meta = request_tod_df(
        dataset_name="apartment-building-registration",
        resource_id="97b8b7a4-baca-49c7-915d-335322dbcf95",
    ).items()
    print(df)
    assert True
