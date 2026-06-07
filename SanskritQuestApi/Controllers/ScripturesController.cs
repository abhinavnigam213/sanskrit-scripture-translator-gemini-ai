using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SanskritQuestApi.Services;

namespace SanskritQuestApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ScripturesController : ControllerBase
{
    private readonly DataService _dataService;

    public ScripturesController(DataService dataService)
    {
        _dataService = dataService;
    }

    [HttpGet]
    public IActionResult GetPopularScriptures()
    {
        return Ok(_dataService.PopularScriptures);
    }
}
