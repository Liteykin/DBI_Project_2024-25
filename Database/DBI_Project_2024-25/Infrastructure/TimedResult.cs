namespace DBI_Project_2024_25.Infrastructure;

public class TimedResult<R>(R result, TimeSpan time)
{
    public R Result { get; set; } = result;
    public TimeSpan Time { get; set; } = time;

    public IResult IntoOkResult()
    {
        return Results.Ok(this);
    }

    public IResult IntoCreatedResult()
    {
        return Results.Ok(this);
    }
}